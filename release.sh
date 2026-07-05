#!/usr/bin/env bash
set -e

dotnet build src/Our.Umbraco.HeadlessPreview \
  --configuration Release \
  /t:rebuild /t:pack \
  -p:PackageOutputPath=../../releases/nuget
