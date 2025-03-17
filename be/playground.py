import os
from dotenv import load_dotenv
from vendor import *

load_dotenv()
MY_JWT = os.getenv("MY_JWT")


scraper = VendorScraper(MY_JWT)
scraper.scrape_all_pages(start_page=1)
