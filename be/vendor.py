import requests
from mongo import vendors_collection

class VendorScraper:
    def __init__(self, jwt_token):
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
