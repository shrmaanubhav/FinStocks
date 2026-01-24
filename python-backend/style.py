styling = """
    <style>
    /* General Page Setup */
    html, body {
        font-family: 'Segoe UI', sans-serif;
        font-size: 18px; /* Increased font size globally */
    }

    .stMarkdown {
        max-width: 100%;
        margin: auto;
        font-size: 1.05rem;
    }

    .css-18ni7ap {  /* Main container width */
        max-width: 1200px;
        padding-left: 2.5rem;
        padding-right: 2.5rem;
    }

    /* Button Container */
    .centered-buttons {
        display: flex;
        justify-content: center;
        align-items: center;
        gap: 2rem;
        margin: 2rem 0;
    }

    /* All Buttons */
    .stButton > button {
        font-size: 1.2rem !important;
        padding: 1em 2.5em !important;
        border-radius: 12px !important;
        font-weight: 600 !important;
        background: linear-gradient(90deg, #00c6ff 0%, #0072ff 100%) !important;
        color: white !important;
        box-shadow: 0 4px 15px rgba(0, 114, 255, 0.25);
        border: none;
        transition: transform 0.15s ease, box-shadow 0.15s ease;
    }

    .stButton > button:hover {
        transform: scale(1.05);
        box-shadow: 0 6px 20px rgba(0, 114, 255, 0.35);
    }

    .stButton > button:active {
        transform: scale(0.98);
    }

    /* Input Query Area */
    input[type="text"], textarea {
        background: #1c1c1e;
        border: 1px solid #444;
        border-radius: 10px;
        color: #eee;
        padding: 14px;
        font-size: 1.05rem;
    }

    /* Highlighted Result Blocks */
    .highlight-box {
        background-color: #2c2f35;
        color: #ffffff;
        padding: 15px;
        border-radius: 10px;
        margin-bottom: 1rem;
        font-size: 1rem;
        border-left: 5px solid #00c6ff;
    }

    /* Stock Tags */
    .stock-detected {
        background-color: #004466;
        color: #a7ffeb;
        border-radius: 6px;
        padding: 12px;
        font-weight: 600;
        font-size: 1rem;
        margin-top: 15px;
        text-align: center;
        box-shadow: 0 4px 10px rgba(0, 198, 255, 0.1);
    }

    /* Center the Get Solution Button */
    .get-solution-center {
        display: flex;
        justify-content: center;
        margin: 2rem 0 1.5rem 0;
    }
    </style>
"""
