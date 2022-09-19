#!/bin/bash

# Copy pdf files to google cloud storage
gsutil storage cp data/minutes_sep/* gs://fomc-files/pdfs/

# Write list of PDF files to file
# https://stackoverflow.com/questions/1521462/looping-through-the-content-of-a-file-in-bash
gsutil ls -r gs://fomc_files/pdfs > list.inputs.txt

# list.inputs.txt
# gs://fomc_files/pdfs/fomcminutes20100428.pdf
# gs://fomc_files/pdfs/fomcminutes20100623.pdf
# gs://fomc_files/pdfs/fomcminutes20101103.pdf
# gs://fomc_files/pdfs/fomcminutes20110126.pdf
# gs://fomc_files/pdfs/fomcminutes20110427.pdf

# Read PDF file names from file and process with gcloud
while IFS="" read -r p || [ -n "$p" ]
do
  echo "Now processing file $p"
  echo "Extracting date from file ... "
  dt=$(echo $p | awk -F'/' '{print $5}' | sed  -e 's/fomcminutes//g' | sed -e 's/\.pdf//g')
  echo "Date parsed to $dt"
  gcloud ml vision detect-text-pdf $p  gs://fomc_files/jsons/out_$dt
 done < list.inputs.txt

# Write list of JSON output file names to file
# Wait a few minutes after OCR or it will retrieve a partial list
gsutil ls -r gs://fomc_files/jsons/*json  > list.outputs.txt
# list.outputs.txt
# gs://fomc_files/jsons/out_20140618output-1-to-20.json
# gs://fomc_files/jsons/out_20140618output-21-to-25.json
# gs://fomc_files/jsons/out_20140917output-1-to-20.json
# gs://fomc_files/jsons/out_20140917output-21-to-26.json

# Download OCR output files locally
while IFS="" read -r p || [ -n "$p" ]
do
  gsutil cp  $p  ../data/data-gen/json/
done < list.outputs.txt

