import os
from dotenv import load_dotenv
from vendor import *
from mongo import temp_vendors_collection, vendors_collection



load_dotenv()
MY_JWT = os.getenv("MY_JWT")


def refresh_vendors():
    print("Refreshing vendors...")
    
    try:
        temp_vendors_collection.delete_many({})

        scraper = VendorScraper(MY_JWT, temp_vendors_collection)
        scraper.scrape_all_vendors()

        count = 0
        while count < 15:
            scraper.fetch_vendors_details()
            sleep(1)
            count += 1

            if temp_vendors_collection.count_documents({"details": {"$exists": False}}) == 0:
                break

        chunk_size = 200
        total_count = temp_vendors_collection.count_documents({"details": {"$exists": False}})
        processed = 0
        
        vendor_ids = [doc["id"] for doc in temp_vendors_collection.find({"details": {"$exists": False}}, {"id": 1})]
        
        print(f"Total vendors to process: {total_count}")
        
        for i in range(0, len(vendor_ids), chunk_size):
            chunk_ids = vendor_ids[i:i+chunk_size]
            chunk_docs = list(temp_vendors_collection.find({"id": {"$in": chunk_ids}}))
            
            for doc in chunk_docs:
                if '_id' in doc:
                    doc.pop('_id')
                
                vendors_collection.update_one(
                    {"id": doc["id"]},
                    {"$set": doc},
                    upsert=True
                )
            
            processed += len(chunk_docs)
            print(f"Processed {processed}/{total_count} vendors")

    except Exception as e:
        print(f"Error refreshing vendors: {e}")

    print("Refreshing vendors: done")

if __name__ == "__main__":
    refresh_vendors()
