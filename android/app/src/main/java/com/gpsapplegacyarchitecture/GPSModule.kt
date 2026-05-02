package com.gpsapplegacyarchitecture

import android.annotation.SuppressLint
import android.content.Context
import android.location.Location
import android.location.LocationListener
import android.location.LocationManager
import android.os.Bundle
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod

class GPSModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {

    override fun getName(): String {
        return "GPSModule"
    }

    @SuppressLint("MissingPermission") // We will handle permissions explicitly in JS
    @ReactMethod
    fun getCurrentLocation(promise: Promise) {
        val locationManager = reactApplicationContext.getSystemService(Context.LOCATION_SERVICE) as LocationManager

        val locationListener = object : LocationListener {
            override fun onLocationChanged(location: Location) {
                val map = Arguments.createMap()
                map.putDouble("latitude", location.latitude)
                map.putDouble("longitude", location.longitude)
                promise.resolve(map)
                locationManager.removeUpdates(this) // Prevent memory leaks
            }
            override fun onStatusChanged(provider: String?, status: Int, extras: Bundle?) {}
            override fun onProviderEnabled(provider: String) {}
            override fun onProviderDisabled(provider: String) {
                promise.reject("GPS_DISABLED", "Location provider is disabled.")
                locationManager.removeUpdates(this)
            }
        }

        try {
            // Request a single update for production efficiency
            locationManager.requestSingleUpdate(LocationManager.GPS_PROVIDER, locationListener, null)
        } catch (e: Exception) {
            promise.reject("GPS_ERROR", e.message)
        }
    }
}