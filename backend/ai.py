import os
import traceback # <--- Added for better error messages
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.prompts import PromptTemplate
from langchain_core.output_parsers import StrOutputParser
from dotenv import load_dotenv

# Load Environment Variables
load_dotenv()

# Initialize Gemini
# If this fails, make sure GOOGLE_API_KEY is in your .env file
llm = ChatGoogleGenerativeAI(
    model="gemini-2.5-flash", 
    temperature=0.5,
    google_api_key=os.getenv("GOOGLE_API_KEY")
)

def ask_ai_advisor(user_profile, financial_data, user_question):
    """
    Sends user data + question to Gemini and gets a response.
    """
    print("--- [AI DEBUG] Connecting to Gemini... ---")
    
    try:
        # 1. Create the Prompt Template
        template = """
        You are an expert AI Financial Advisor. 
        You are speaking to {name}.
        
        Here is their financial snapshot:
        - Monthly Income: ${income}
        - Risk Tolerance: {risk}
        - Recent Transactions: {transactions}
        - Current Assets (Portfolio): {assets}
        
        User Question: "{question}"
        
        Analyze their finances and give a helpful, data-driven answer. 
        Keep it concise, friendly, and structured.
        """
        
        prompt = PromptTemplate(
            input_variables=["name", "income", "risk", "transactions", "assets", "question"],
            template=template
        )
        
        # 2. Define the Chain
        # Ensure StrOutputParser has parentheses () at the end!
        chain = prompt | llm | StrOutputParser()
        
        # 3. Run the Chain
        response = chain.invoke({
            "name": user_profile['name'],
            "income": user_profile['income'],
            "risk": user_profile['risk'],
            "transactions": financial_data['transactions'],
            "assets": financial_data['assets'],
            "question": user_question
        })
        
        print("--- [AI DEBUG] Success! ---")
        return response

    except Exception as e:
        print("!!! AI ERROR !!!")
        traceback.print_exc() # This prints the full error to your terminal
        raise e