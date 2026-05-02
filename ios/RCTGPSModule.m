//
//  RCTGPSModule.m
//  GPSAppLegacyArchitecture
//
//  Created by Neel Bhandari (Digital,ISC) (X-Statusneo) on 02/05/26.
//

#import "RCTGPSModule.h"

@implementation RCTGPSModule {
    CLLocationManager *locationManager;
    RCTPromiseResolveBlock resolveBlock;
    RCTPromiseRejectBlock rejectBlock;
}

// Exposes this module to JS as NativeModules.GPSModule
RCT_EXPORT_MODULE(GPSModule);

// Exposes the method to JS
RCT_EXPORT_METHOD(getCurrentLocation:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject) {
    // CoreLocation must run on the main thread
    dispatch_async(dispatch_get_main_queue(), ^{
        if (!self->locationManager) {
            self->locationManager = [[CLLocationManager alloc] init];
            self->locationManager.delegate = self;
            self->locationManager.desiredAccuracy = kCLLocationAccuracyBest;
        }

        // Store the promise blocks to resolve/reject later
        self->resolveBlock = resolve;
        self->rejectBlock = reject;

        [self->locationManager requestLocation];
    });
}

// CLLocationManagerDelegate: Success
- (void)locationManager:(CLLocationManager *)manager didUpdateLocations:(NSArray<CLLocation *> *)locations {
    CLLocation *location = [locations lastObject];
    if (location && self->resolveBlock) {
        self->resolveBlock(@{
            @"latitude": @(location.coordinate.latitude),
            @"longitude": @(location.coordinate.longitude)
        });
        // Clear blocks to prevent memory leaks or double-resolving
        self->resolveBlock = nil;
        self->rejectBlock = nil;
    }
}

// CLLocationManagerDelegate: Failure
- (void)locationManager:(CLLocationManager *)manager didFailWithError:(NSError *)error {
    if (self->rejectBlock) {
        self->rejectBlock(@"GPS_ERROR", error.localizedDescription, error);
        self->resolveBlock = nil;
        self->rejectBlock = nil;
    }
}

@end
