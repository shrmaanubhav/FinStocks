from transformers import pipeline

MODEL_PATH = r".\models\models--mrm8488--distilroberta-finetuned-financial-news-sentiment-analysis\snapshots\ae0eab9ad336d7d548e0efe394b07c04bcaf6e91"
classifier = pipeline(
    "sentiment-analysis",
    model=MODEL_PATH,
    tokenizer=MODEL_PATH,
)

while True:
    text = input("Enter financial news (0000 to exit): ")

    if text == "0000":
        print("Bye 👋")
        break

    result = classifier(text)[0]
    print("Sentiment:", result["label"], "| Score:", round(result["score"], 4))
    print("-" * 50)
