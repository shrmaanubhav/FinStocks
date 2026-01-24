from transformers import pipeline

MODEL_PATH = r".\models\models--nickmuchi--finbert-tone-finetuned-finance-topic-classification\snapshots\ee9b951e726648dba828e6b2b7035ddb4ff41759"
classifier = pipeline(
    "text-classification",
    model=MODEL_PATH,
    tokenizer=MODEL_PATH,
)

while True:
    text = input("Enter financial news (0000 to exit): ")

    if text == "0000":
        print("Bye 👋")
        break

    result = classifier(text)[0]
    print("Topic:", result["label"], "| Score:", round(result["score"], 4))
    print("-" * 50)
