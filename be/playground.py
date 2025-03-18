import os
from time import sleep
from dotenv import load_dotenv
from vendor import *
import asyncio
import concurrent.futures

load_dotenv()
MY_JWT = os.getenv("MY_JWT")


scraper = VendorScraper(MY_JWT)

def scrape_all_vendors():
    print("fetching all vendors...")
    scraper.scrape_all_pages(start_page=1)
    print("fetching all vendors: done")


def fetch_vendors_details():
    print("fetching vendor details...")

    vendors = vendors_collection.find({"details": {"$exists": False}}, {"id": 1})
    vendors_list = list(vendors)

    def process_vendor(vendor):
        print("fetching vendor details for", vendor["id"])
        result = scraper.fetch_vendor_details(vendor["id"])
        scraper.store_vendor_details(vendor["id"], result)
        return vendor["id"]

    batch_size = 50
    for i in range(0, len(vendors_list), batch_size):
        batch = vendors_list[i:i+batch_size]
        
        with concurrent.futures.ThreadPoolExecutor(max_workers=batch_size) as executor:
            futures = [executor.submit(process_vendor, vendor) for vendor in batch]
            for future in concurrent.futures.as_completed(futures):
                vendor_id = future.result()
                print(f"Completed vendor {vendor_id}")
        
        sleep(0.1)

    print("fetching vendor details: done")
