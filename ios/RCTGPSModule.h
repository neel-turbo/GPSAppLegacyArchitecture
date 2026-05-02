//
//  RCTGPSModule.h
//  GPSAppLegacyArchitecture
//
//  Created by Neel Bhandari (Digital,ISC) (X-Statusneo) on 02/05/26.
//

#import <React/RCTBridgeModule.h>
#import <CoreLocation/CoreLocation.h>

@interface RCTGPSModule : NSObject <RCTBridgeModule, CLLocationManagerDelegate>
@end
