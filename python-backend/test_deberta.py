from transformers import pipeline

MODEL_PATH = r".\models\models--mrm8488--deberta-v3-ft-financial-news-sentiment-analysis\snapshots\9e10915c245a80a89b18d1ac51350e093c7bb35a"

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
