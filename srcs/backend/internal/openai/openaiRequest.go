package openai

import (
	"context"
  "sync"
  "fmt"
	"errors"
	"log"
	"net/http"
  "encoding/json"
	"os"

	openai "github.com/openai/openai-go/v3"
  "github.com/openai/openai-go/v3/option"
)

type OpenAi struct {
  Prompt string `json:"Prompt"`
  Request string `json:"Request"`
}

type PubMedRequestCreation struct {
  Prompt string `json:"prompt"`
}

func GeneratePubMedRequestLink(w http.ResponseWriter, r *http.Request) {
  if r.Method != http.MethodPost {
    http.Error(w, "Méthode non autorisée", http.StatusMethodNotAllowed)
		return 
  }
  var req PubMedRequestCreation

  err := json.NewDecoder(r.Body).Decode(&req)
  if (err != nil) {
    http.Error(w, "Invalid JSON", http.StatusBadRequest)
    return
  }
  
  var result string
  var systemPrompt string = "You are a medical research expert fluent in PubMed syntax. Return only the optimized PubMed search query using English terms, without any explanation. Ensure the search targets terms in titles or abstracts (use [tiab])."
  var userPrompt string = "Based on the input text, craft the best possible PubMed query in English to retrieve 3 relevant scientific articles where the terms appear in title or abstract: " + req.Prompt

  result, err = OpenAiRequest(userPrompt, systemPrompt, "gpt-5-nano")
  if (err != nil) {
    log.Printf("%v", err)
    http.Error(w, "Error openai", http.StatusInternalServerError)
    return
  }

  log.Printf("result: %v", result)

}


var (
	clientOnce sync.Once
	clientInst *openai.Client
)

func getClient() *openai.Client {
	clientOnce.Do(func() {
		apiKey := os.Getenv("OPENAI_APIKEY")
		if apiKey == "" {
			panic("OPENAI_APIKEY is not set")
		}
    c := openai.NewClient(
			option.WithAPIKey(apiKey),
		)
    clientInst = &c
	})
	return clientInst
}

func OpenAiRequest(userPrompt string, promptSystem string, model string) (string, error) {
  var ret string = ""
  var err error = nil 

  openai_key := os.Getenv("OPENAI_APIKEY")
  if (openai_key == "") {
    return "", errors.New("OPENAI_APIKEY is not set")
  }
  if (userPrompt == "" || promptSystem == "") {
    return "", errors.New("prompt is empty") 
  }

  // client := openai.NewClient(
  //   option.WithAPIKey(openai_key),
  // )
  client := getClient()
  
  log.Printf("promptSystem: %v\npromptUser: %v", promptSystem, userPrompt)
  resp, err := client.Chat.Completions.New(
    context.Background(),
    openai.ChatCompletionNewParams{
        //Model: openai.ChatModel("gpt-4o-mini"),
        Model: openai.ChatModel(model),

        //MaxCompletionTokens: openai.Int(150), // ⬅️ CRUCIAL
        // // Temperature: openai.Float(0.2), // ⬅️ réduit la variance
        // TopP: openai.Float(1.0),

        Messages: []openai.ChatCompletionMessageParamUnion{
          openai.SystemMessage(promptSystem),
          openai.UserMessage(userPrompt),
        },
    },
  )

  if err != nil {
    log.Printf("Error: %v", err)
    return ret, err
  }

  fmt.Println("Total tokens:", resp.Usage.TotalTokens)

  ret = resp.Choices[0].Message.Content
  return ret, err 
}


