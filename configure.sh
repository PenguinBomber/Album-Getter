#!/bin/bash
echo "API key:";
read A; 
echo "{" > key.json;
printf "	\"apiKey\" : \"" >> key.json
printf "$A" >> key.json
echo "\"" >> key.json
echo "}" >> key.json