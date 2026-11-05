# Mobile prototype (experimental)

This directory contains the original Expo/React Native proof of concept. It is retained as a reference, but it is **not part of the production-ready web application**.

Before using it with real users, replace the simulated authentication token, move the API URL into environment configuration, implement a real login/session flow, verify platform-specific location permissions, and design/test background tracking and privacy controls. The current prototype uses foreground location updates only.

Install its dependencies from this directory with `npm install`, then use the Expo CLI appropriate for your environment. Do not reuse the simulated token against a live backend.
