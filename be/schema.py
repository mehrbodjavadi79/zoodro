from typing import List, Optional
from dataclasses import dataclass

@dataclass
class City:
    id: int
    cityName: str
    cityLat: float
    cityLong: float

@dataclass
class Area:
    id: int
    areaName: str
    city: City

@dataclass
class VendorTag:
    id: int
    level: int
    parentID: int
    tagName: str

@dataclass
class VendorBanner:
    bannerURL: str

@dataclass
class Vendor:
    distance: float
    isLiked: bool
    id: int
    superType: Optional[str]
    vendorTag: List[VendorTag]
    vendorBanner: List[VendorBanner]
    priceRange: int
    title: str
    profilePictureURL: str
    userName: str
    latitude: float
    longitude: float
    maxOfferPercent: float
    area: Area
    totalReviews: int
    rating: float
    hasNewTag: bool
    navigationJson: Optional[str]
    vendorRamadanStatus: int

@dataclass
class PageStructureItem:
    items: List[Vendor]
    id: int
    pageStructureItemStatus: int
    pageStructureItemType: int
    pageType: int
    rowIndex: float
    title: Optional[str]
    showMoreLink: Optional[str]
    bannerPositions: Optional[str]
    pageStructureChannels: Optional[str]
    isPrivate: bool

@dataclass
class Response:
    pageStructureItems: List[PageStructureItem]
    isEndOfList: bool 