from typing import List, Optional, Union
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

@dataclass
class WeekDay:
    id: int
    weekDayName: str
    gregorianDay: int

@dataclass
class VendorShift:
    weekDay: WeekDay
    startHour: int
    startMinute: int
    endHour: int
    endMinute: int

@dataclass
class Channel:
    id: int
    label: str
    isFoodro: bool
    logoURL: str

@dataclass
class VendorChannelRating:
    channel: Channel
    scoreCount: int
    rating: float
    isNewTag: bool

@dataclass
class VendorProfile:
    totalReviews: int
    totalUGC: int
    totalAlbumImages: int
    totalMenuImages: int
    rating: float
    vendorChannelRatings: List[VendorChannelRating]

@dataclass
class SuperType:
    id: int
    superTypeName: str

@dataclass
class SubType:
    id: int
    subTypeName: str

@dataclass
class AlbumImage:
    albumURL: str
    isBigImage: bool

@dataclass
class MenuImage:
    menueURL: str

@dataclass
class VendorLineNumber:
    lineNumber: str

@dataclass
class VendorNavigation:
    subTypes: List[SubType]
    tags: List[VendorTag]
    albums: List[AlbumImage]
    banners: List[VendorBanner]
    menues: List[MenuImage]
    facilities: List
    vendorShifts: List[VendorShift]
    vendorLineNumbers: List[VendorLineNumber]

@dataclass
class User:
    id: int
    firstName: Optional[str]
    lastName: Optional[str]
    userName: str
    bio: Optional[str]
    userType: int
    phoneNumber: str
    profilePic: Optional[dict]
    subscriptionType: int
    subscriptionExpirationDate: str
    snappFoodID: str

@dataclass
class ReviewVendor:
    id: int
    owner: Optional[str]
    title: str
    profilePictureURL: str
    userName: str
    area: Optional[str]
    vendorRamadanStatus: int

@dataclass
class Review:
    targetUserID: int
    targetUserName: Optional[str]
    isLiked: bool
    isBookmarked: bool
    id: int
    createdAt: str
    updatedAt: str
    user: User
    isTargetedVendor: bool
    reviewSource: int
    vendor: ReviewVendor
    reviewLabels: List
    reviewText: str
    reviweProcessedText: str
    reviewImages: List
    score: int
    channel: Channel
    justScore: bool
    reviewStatus: int
    reviewType: int
    totalLikes: int
    totalComments: int

@dataclass
class OfferShift:
    id: int
    createdAt: str
    weekDay: WeekDay
    startHour: int
    startMinute: int
    endHour: int
    endMinute: int
    offer: Optional[dict] = None

@dataclass
class Offer:
    id: int
    title: Optional[str]
    capacity: int
    hasUnlimitedCount: bool
    currentUsage: int
    offerPercent: float
    upperLimit: float
    lowerLimit: float
    isForFirstPayment: bool
    limitPerUserPerDay: int
    limitPerUserTotally: int
    shifts: List[OfferShift]

@dataclass
class VendorDetails:
    id: int
    lastMenuUpdate: str
    superType: SuperType
    address: str
    bio: Optional[str]
    priceRange: int
    title: str
    profilePictureURL: str
    userName: str
    canPayment: bool
    latitude: float
    longitude: float
    maxOfferPercent: float
    area: Area
    vendorProfile: VendorProfile
    vendorNavigation: VendorNavigation
    isLiked: bool
    currentShift: VendorShift
    nextShift: VendorShift
    coverPhotoURL: str
    totalRatings: int
    distance: float
    totalReviews: int
    rating: float
    hasNewTag: bool
    headLineReviews: List[Review]
    isOpenNow: bool
    hasOffer: bool
    offer: Optional[Offer]
    currentActiveOfferShift: Optional[OfferShift]
    totalActiveOfferShifts: List[OfferShift]
    hasProPayment: bool
    vendorRamadanStatus: int

@dataclass
class VendorDTO:
    lat: float
    lng: float
    name: str
    off: int
    max: Optional[int]
    min: Optional[int]

@dataclass
class VendorsResponse:
    vendors: List[VendorDTO] 