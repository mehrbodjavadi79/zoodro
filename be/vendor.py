import requests
from mongo import vendors_collection

class VendorScraper:
    def __init__(self, jwt_token):
        self.jwt_token = jwt_token
        self.vendors_collection = vendors_collection

    def fetch_page(self, page_number, page_size):
        cookies = {
            'rl_page_init_referrer': 'RudderEncrypt%3AU2FsdGVkX1%2BQlt9CWMRJvpFowIHu7xhMG8Qbw4SG0ZoE64z7%2FCGyG%2BNTakf2IWqo',
            'rl_page_init_referring_domain': 'RudderEncrypt%3AU2FsdGVkX19Sx%2B2sOgJhEgH%2FVioG6QSeD8tkMw3Ntmabasovl2W3teH62a%2Bf9dIo',
            '_gcl_au': '1.1.1894155152.1733580242',
            '_ym_d': '1736849037',
            '_clck': '11a05ld%7C2%7Cfsq%7C0%7C1840',
            '_ga_5RS662533M': 'GS1.2.1737391261.2.1.1737391487.0.0.0',
            '_ga_EH0ZS5CKXJ': 'GS1.2.1737391261.3.1.1737392407.60.0.0',
            '_ga_DLKJDL41ZH': 'GS1.1.1737453636.5.0.1737453636.60.0.0',
            '_ga_G5J9VQQMGL': 'GS1.1.1737453636.5.0.1737453636.60.0.0',
            'rl_group_id': 'RudderEncrypt%3AU2FsdGVkX19nVKDbaIYxJxIs74IME237Amoh%2Fzfv8%2BA%3D',
            'rl_group_trait': 'RudderEncrypt%3AU2FsdGVkX181r6FgOr%2BWa6Ah0sl%2FSQDAjyW3hXhjNz0%3D',
            'rl_anonymous_id': 'RudderEncrypt%3AU2FsdGVkX185z4yzsoYvUSgYaHx8ehgtwNbMri7SyTkiI%2F0cgW4WRZGrQQni50CSJ0GNS44X7O4SCtJYmExIwQ%3D%3D',
            'rl_user_id': 'RudderEncrypt%3AU2FsdGVkX1%2BUBFqVyQNwKTPzwYryPb%2FduR0Q8LLruVI%3D',
            'rl_trait': 'RudderEncrypt%3AU2FsdGVkX1%2FMjE1nQcuthj%2BSdGLUTk%2BttHA991LCQ0wKZwlmL0GutWlRTC9uETOJHclJQBma9njGg2KLsZAPD8OhlT0zPxKbaLJQIbqMwYobI%2F21MwqqVViJ6DJM7aKPOeD2X94%2Brnaohbr0sRAyi5YrFqYsMHXeVtHJmW94z8zukK39PSk0UXjVB0mnEdlH',
            'rl_session': 'RudderEncrypt%3AU2FsdGVkX1%2Boaj%2BTMmdFwJJsCkSgOAw7ULGI%2BhgBDPJuNKnUiQs%2FlPyog7Q6Nrg14rAB%2Fw%2BPhR7q7nE9mRiBS2nSKLZnJZOk6edzVC3JoSxj2V%2BhqH7WOKVcs1bWqRctmFj%2BPn148iiZ5Qpgah50eA%3D%3D',
        }

        headers = {
            'accept': 'application/json, text/plain, */*',
            'accept-language': 'en-US,en;q=0.9',
            'access-control-allow-credentials': 'true',
            'access-control-allow-headers': 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version',
            'access-control-allow-methods': 'GET,OPTIONS,PATCH,DELETE,POST,PUT',
            'access-control-allow-origin': '*',
            'authorization': f'jwt {self.jwt_token}',
            'dnt': '1',
            'origin': 'https://foodro.snappfood.ir',
            'priority': 'u=1, i',
            'referer': 'https://foodro.snappfood.ir/',
            'sec-fetch-dest': 'empty',
            'sec-fetch-mode': 'cors',
            'sec-fetch-site': 'same-site',
            'user-agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Mobile/15E148 Safari/604.1',
        }

        params = {
            'pageNumber': page_number,
            'pageSize': page_size,
        }

        response = requests.get(
            'https://foodro-api.snappfood.ir/CustomerVendor/GetHomePageList',
            params=params,
            cookies=cookies,
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

    def scrape_all_pages(self, start_page=1, page_size=20):
        page_number = start_page
        while True:
            try:
                response_data = self.fetch_page(page_number, page_size)
                vendors = self.extract_vendors(response_data)
                self.store_vendors(vendors)
                print(f"Successfully processed page {page_number}")
                page_number += 1
            except Exception as e:
                print(f"Error scraping page {page_number}: {e}")
                break
