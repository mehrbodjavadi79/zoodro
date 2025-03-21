import requests
from time import sleep
import concurrent.futures


class VendorScraper:
    def __init__(self, jwt_token, vendors_collection):
        self.jwt_token = jwt_token
        self.vendors_collection = vendors_collection
    
    def fetch_vendor_details(self, vendor_id):
        headers = {
            'accept': 'application/json',
            'authorization': f'jwt {self.jwt_token}',
            'origin': 'https://foodro.snappfood.ir',
            'referer': 'https://foodro.snappfood.ir/',
            'user-agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Mobile/15E148 Safari/604.1',
        }

        response = requests.get(
            f'https://foodro-api.snappfood.ir/CustomerVendor/GetVendorDetail?vendorID={vendor_id}',
            headers=headers,
        )

        if response.status_code != 200:
            print("error in fetching vendor details", response.status_code, response.json())

        return response.json()

    def fetch_page(self, page_number, page_size):
        headers = {
            'accept': 'application/json',
            'authorization': f'jwt {self.jwt_token}',
            'origin': 'https://foodro.snappfood.ir',
            'referer': 'https://foodro.snappfood.ir/',
            'user-agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Mobile/15E148 Safari/604.1',
        }

        params = {
            'pageNumber': page_number,
            'pageSize': page_size,
        }

        response = requests.get(
            'https://foodro-api.snappfood.ir/CustomerVendor/GetHomePageList',
            params=params,
            headers=headers,
        )

        return response.json()

    def extract_vendors(self, response_data):
        vendors = []
        for section in response_data.get('sections', []):
            if isinstance(section, dict) and 'items' in section:
                vendors.extend(section['items'])
        return vendors

    def store_vendors(self, vendors):
        if vendors:
            # Use vendor id as unique identifier
            for vendor in vendors:
                self.vendors_collection.update_one(
                    {'id': vendor['id']},
                    {'$set': vendor},
                    upsert=True
                )
            print(f"Successfully processed {len(vendors)} vendors in MongoDB")
    
    def store_vendor_details(self, vendor_id, vendor_details):
        self.vendors_collection.update_one(
            {'id': vendor_id},
            {'$set': {'details': vendor_details}},
            upsert=True
        )

    def scrape_all_pages(self, start_page=1, page_size=20):
        page_number = start_page
        while True:
            try:
                response_data = self.fetch_page(page_number, page_size)
                vendors = self.extract_vendors(response_data)
                self.store_vendors(vendors)
                print(f"Successfully processed page {page_number}")
                page_number += 1
                if len(vendors) == 0:
                    break
            except Exception as e:
                print(f"Error scraping page {page_number}: {e}")
                break
    
    def scrape_all_vendors(self):
        print("fetching all vendors...")
        self.scrape_all_pages(start_page=1)
        print("fetching all vendors: done")


    def fetch_vendors_details(self):
        print("fetching vendor details...")

        vendors = self.vendors_collection.find({"details": {"$exists": False}}, {"id": 1})
        vendors_list = list(vendors)

        print(f"Total vendors to process: {len(vendors_list)}")

        def process_vendor(vendor):
            print("fetching vendor details for", vendor["id"])
            try:
                result = self.fetch_vendor_details(vendor["id"])
                self.store_vendor_details(vendor["id"], result)
                return vendor["id"]
            except Exception as e:
                print(f"Error fetching vendor details for {vendor['id']}: {e}")
                return None

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

