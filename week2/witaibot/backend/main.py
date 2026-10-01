import os
import requests
import re

from bs4 import BeautifulSoup
from pathlib import Path
from urllib.parse import urljoin, urlparse

from dotenv import load_dotenv

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from pydantic import BaseModel, Field

from groq import Groq


# ============================================================
# LOAD ENVIRONMENT VARIABLES
# ============================================================

#BASE_DIR = Path(__file__).resolve().parent BASE_DIR / ".env"

load_dotenv()


# ============================================================
# FASTAPI APPLICATION
# ============================================================

app = FastAPI(
    title="WIT AI Bot API",
    description="AI chatbot for Walchand Institute of Technology, Solapur",
    version="3.0"
)


# ============================================================
# CORS
# ============================================================

app.add_middleware(
    CORSMiddleware,

    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],

    allow_credentials=True,

    allow_methods=["*"],

    allow_headers=["*"],
)


# ============================================================
# GROQ CONFIGURATION
# ============================================================

api_key = os.getenv("GROQ_API_KEY")

if not api_key:

    raise RuntimeError(
        "GROQ_API_KEY is missing. "
        "Add it to backend/.env"
    )


client = Groq(
    api_key=api_key
)


MODEL = os.getenv(
    "GROQ_MODEL",
    "openai/gpt-oss-20b"
)


# ============================================================
# WEBSITE CONFIGURATION
# ============================================================

BASE_URL = "https://witsolapur.org/"

MAX_PAGES = 60

MAX_TEXT_PER_PAGE = 20000

MAX_CONTEXT = 30000


# ============================================================
# WEBSITE DATA
# ============================================================

# Instead of one huge string, we store
# each webpage separately.

WEBSITE_PAGES = {}


# ============================================================
# HTTP SESSION
# ============================================================

def create_session():

    session = requests.Session()

    session.headers.update({

        "User-Agent": (
            "Mozilla/5.0 "
            "(Windows NT 10.0; Win64; x64) "
            "AppleWebKit/537.36 "
            "(KHTML, like Gecko) "
            "Chrome/131.0.0.0 "
            "Safari/537.36"
        ),

        "Accept": (
            "text/html,"
            "application/xhtml+xml,"
            "application/xml;q=0.9,"
            "*/*;q=0.8"
        ),

        "Accept-Language": (
            "en-US,en;q=0.9"
        ),

        "Accept-Encoding": (
            "gzip, deflate"
        ),

        "Connection": "keep-alive",

    })

    return session


# ============================================================
# CLEAN URL
# ============================================================

def clean_url(url):

    # Remove fragments

    url = url.split("#")[0]

    # Remove trailing slash for comparison

    if url != BASE_URL:

        url = url.rstrip("/")

    return url


# ============================================================
# CHECK WHETHER URL IS HTML PAGE
# ============================================================

def is_valid_page_url(url):

    parsed = urlparse(url)

    # Must use HTTP/HTTPS

    if parsed.scheme not in [
        "http",
        "https"
    ]:

        return False


    # Must belong to WIT website

    if not parsed.netloc.endswith(
        "witsolapur.org"
    ):

        return False


    # Don't download files

    blocked_extensions = [

        ".pdf",
        ".jpg",
        ".jpeg",
        ".png",
        ".gif",
        ".webp",
        ".svg",
        ".mp4",
        ".mp3",
        ".zip",
        ".doc",
        ".docx",
        ".xls",
        ".xlsx",
    ]


    path = parsed.path.lower()


    for extension in blocked_extensions:

        if path.endswith(extension):

            return False


    return True


# ============================================================
# GET WEBSITE LINKS
# ============================================================

def get_website_links(session):

    links = set()

    try:

        print(
            "\nFetching homepage:"
        )

        print(BASE_URL)


        response = session.get(

            BASE_URL,

            timeout=20,

            allow_redirects=True

        )


        print(
            "Homepage Status Code:",
            response.status_code
        )


        if response.status_code != 200:

            print(
                "Homepage could not be loaded."
            )

            return []


        soup = BeautifulSoup(

            response.content,

            "html.parser"

        )


        for link in soup.find_all(
            "a",
            href=True
        ):

            href = link.get("href")


            if not href:

                continue


            full_url = urljoin(
                BASE_URL,
                href
            )


            full_url = clean_url(
                full_url
            )


            if is_valid_page_url(
                full_url
            ):

                links.add(
                    full_url
                )


        print(
            "Internal HTML pages found:",
            len(links)
        )


    except Exception as e:

        print(
            "\nLink extraction error:"
        )

        print(
            type(e).__name__,
            str(e)
        )


    return list(links)


# ============================================================
# EXTRACT TEXT FROM PAGE
# ============================================================

def extract_page_text(
    session,
    url
):

    try:

        print(
            f"\nFetching page: {url}"
        )


        response = session.get(

            url,

            timeout=20,

            allow_redirects=True

        )


        print(
            "Status:",
            response.status_code
        )


        if response.status_code != 200:

            print(
                "Skipping page."
            )

            return ""


        content_type = response.headers.get(
            "content-type",
            ""
        ).lower()


        # Only process HTML

        if "text/html" not in content_type:

            print(
                "Skipping non-HTML content."
            )

            return ""


        soup = BeautifulSoup(

            response.content,

            "html.parser"

        )


        # Remove unnecessary elements

        for tag in soup([

            "script",
            "style",
            "nav",
            "footer",
            "header",
            "noscript",
            "svg",

        ]):

            tag.decompose()


        # Extract text

        page_text = soup.get_text(

            separator=" ",

            strip=True

        )


        # Normalize whitespace

        page_text = re.sub(
            r"\s+",
            " ",
            page_text
        )


        # Limit page size

        page_text = page_text[
            :MAX_TEXT_PER_PAGE
        ]


        print(
            "Characters extracted:",
            len(page_text)
        )


        return page_text


    except Exception as e:

        print(
            f"\nPage extraction error:"
        )

        print(
            url
        )

        print(
            type(e).__name__,
            str(e)
        )

        return ""


# ============================================================
# FETCH WEBSITE
# ============================================================

def fetch_website_content():

    global WEBSITE_PAGES

    WEBSITE_PAGES = {}


    session = create_session()


    # --------------------------------------------------------
    # GET LINKS
    # --------------------------------------------------------

    links = get_website_links(
        session
    )


    # Homepage should always be first

    pages_to_fetch = [
        BASE_URL
    ]


    # Add discovered links

    for link in links:

        if clean_url(link) != clean_url(BASE_URL):

            pages_to_fetch.append(
                link
            )


    # Remove duplicates

    pages_to_fetch = list(
        dict.fromkeys(
            pages_to_fetch
        )
    )


    # Limit pages

    pages_to_fetch = pages_to_fetch[
        :MAX_PAGES
    ]


    print(
        "\n===================================="
    )

    print(
        "PAGES TO FETCH:",
        len(pages_to_fetch)
    )

    print(
        "===================================="
    )


    # --------------------------------------------------------
    # FETCH EACH PAGE
    # --------------------------------------------------------

    for url in pages_to_fetch:

        text = extract_page_text(
            session,
            url
        )


        if len(text) > 100:

            WEBSITE_PAGES[url] = text


    print(
        "\n===================================="
    )

    print(
        "WEBSITE LOADING COMPLETED"
    )

    print(
        "Pages successfully loaded:",
        len(WEBSITE_PAGES)
    )

    print(
        "===================================="
    )


    return WEBSITE_PAGES


# ============================================================
# FIND RELEVANT WEBSITE CONTENT
# ============================================================

def find_relevant_content(
    question
):

    if not WEBSITE_PAGES:

        return ""


    # Convert question to words

    question_words = set(
        re.findall(
            r"\b[a-zA-Z]{3,}\b",
            question.lower()
        )
    )


    scored_pages = []


    # --------------------------------------------------------
    # SCORE EACH PAGE
    # --------------------------------------------------------

    for url, text in WEBSITE_PAGES.items():

        text_lower = text.lower()


        score = 0


        # Keyword matching

        for word in question_words:

            if word in text_lower:

                score += 1


        # Give extra importance to URL keywords

        url_lower = url.lower()


        for word in question_words:

            if word in url_lower:

                score += 3


        scored_pages.append(
            (
                score,
                url,
                text
            )
        )


    # Sort highest relevance first

    scored_pages.sort(
        key=lambda x: x[0],
        reverse=True
    )


    # --------------------------------------------------------
    # SELECT TOP PAGES
    # --------------------------------------------------------

    selected_pages = scored_pages[:4]


    context = ""


    for score, url, text in selected_pages:

        if score == 0:

            continue


        context += f"""

========================================
SOURCE: {url}
RELEVANCE SCORE: {score}
========================================

{text}

"""


        # Keep context under limit

        if len(context) >= MAX_CONTEXT:

            break


    # If nothing matched,
    # use homepage as fallback

    if not context:

        homepage_text = WEBSITE_PAGES.get(
            BASE_URL,
            ""
        )


        context = f"""

========================================
SOURCE: {BASE_URL}
========================================

{homepage_text[:6000]}

"""


    return context[:MAX_CONTEXT]


# ============================================================
# INITIAL WEBSITE LOAD
# ============================================================

print(
    "\nLoading WIT website information..."
)


fetch_website_content()


if WEBSITE_PAGES:

    print(
        "\nWebsite information loaded successfully."
    )

    print(
        "Total pages:",
        len(WEBSITE_PAGES)
    )

else:

    print(
        "\nWARNING:"
    )

    print(
        "No website pages could be loaded."
    )


# ============================================================
# PYDANTIC MODELS
# ============================================================

class ChatRequest(BaseModel):

    question: str = Field(
        ...,
        min_length=1,
        max_length=4000
    )


class ChatResponse(BaseModel):

    answer: str


# ============================================================
# HOME
# ============================================================

@app.get("/")
def home():

    return {

        "message":
            "WIT AI Bot backend is running",

        "model":
            MODEL,

        "website_data_loaded":
            bool(WEBSITE_PAGES),

        "pages_loaded":
            len(WEBSITE_PAGES)

    }


# ============================================================
# HEALTH
# ============================================================

@app.get("/health")
def health():

    return {

        "status":
            "healthy",

        "website_data_loaded":
            bool(WEBSITE_PAGES),

        "pages_loaded":
            len(WEBSITE_PAGES)

    }


# ============================================================
# REFRESH WEBSITE
# ============================================================

@app.post("/refresh-website")
def refresh_website():

    try:

        print(
            "\nRefreshing website..."
        )


        fetch_website_content()


        return {

            "message":
                "Website information refreshed",

            "pages_loaded":
                len(WEBSITE_PAGES)

        }


    except Exception as e:

        print(
            "Refresh error:",
            type(e).__name__,
            str(e)
        )


        raise HTTPException(

            status_code=500,

            detail=str(e)

        )


# ============================================================
# CHAT
# ============================================================

@app.post(
    "/chat",
    response_model=ChatResponse
)
def chat(request: ChatRequest):

    try:

        # ----------------------------------------------------
        # CHECK WEBSITE DATA
        # ----------------------------------------------------

        if not WEBSITE_PAGES:

            raise HTTPException(

                status_code=503,

                detail=(
                    "WIT website information "
                    "has not been loaded."
                )

            )


        # ----------------------------------------------------
        # FIND RELEVANT WEBSITE INFORMATION
        # ----------------------------------------------------

        relevant_content = (
            find_relevant_content(
                request.question
            )
        )


        print(
            "\n===================================="
        )

        print(
            "USER QUESTION:"
        )

        print(
            request.question
        )

        print(
            "===================================="
        )


        print(
            "Relevant context length:",
            len(relevant_content)
        )


        # ----------------------------------------------------
        # AI SYSTEM PROMPT
        # ----------------------------------------------------

        system_prompt = f"""

You are WIT AI.

You are an intelligent virtual assistant
for Walchand Institute of Technology,
Solapur, Maharashtra.

Your job is to help students, parents,
visitors and applicants understand WIT.


IMPORTANT INSTRUCTIONS:

1. Answer WIT-specific questions using
the website information provided below.

2. Do not invent information.

3. If the answer is not present in the
provided website information, clearly say:

"I could not find this information in
the currently available WIT website data.
Please check the official WIT website
for the latest information."

4. Do not guess:

- fees
- admission dates
- examination dates
- placement packages
- faculty information
- results
- official policies
- notices

5. For information that changes frequently,
recommend checking:

https://witsolapur.org/


6. Keep answers simple and student-friendly.

7. Do not claim that you are an official
college employee.

8. When useful, mention the relevant
website source URL.


========================================
RELEVANT WIT WEBSITE INFORMATION
========================================

{relevant_content}

========================================
END WEBSITE INFORMATION
========================================

"""


        # ----------------------------------------------------
        # SEND REQUEST TO GROQ
        # ----------------------------------------------------

        completion = client.chat.completions.create(

            model=MODEL,

            messages=[

                {
                    "role":
                        "system",

                    "content":
                        system_prompt
                },

                {
                    "role":
                        "user",

                    "content":
                        request.question
                }

            ],

            temperature=0.2,

            max_completion_tokens=800

        )


        # ----------------------------------------------------
        # GET ANSWER
        # ----------------------------------------------------

        answer = (
            completion
            .choices[0]
            .message
            .content
        )


        if not answer:

            answer = (
                "Sorry, I could not generate "
                "a response. Please try again."
            )


        return ChatResponse(

            answer=answer

        )


    # --------------------------------------------------------
    # HTTP EXCEPTION
    # --------------------------------------------------------

    except HTTPException:

        raise


    # --------------------------------------------------------
    # ACTUAL ERROR
    # --------------------------------------------------------

    except Exception as exc:

        print(
            "\n===================================="
        )

        print(
            "CHAT ERROR"
        )

        print(
            "===================================="
        )

        print(
            "Error type:",
            type(exc).__name__
        )

        print(
            "Error:",
            str(exc)
        )

        print(
            "====================================\n"
        )


        raise HTTPException(

            status_code=500,

            detail=str(exc)

        )