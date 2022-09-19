#| code-fold:true
# Import required libraries
import os
import re
import csv
import io
import tempfile
import json
import sys
from pprint import pprint
from google.protobuf import json_format
import pandas as pd
import numpy as np
import jenkspy
import pickle

# %%
# Define function to extract information from JSON file
# https://github.com/kazunori279/pdf2audiobook/blob/master/functions/app/main.py
# https://stackoverflow.com/questions/51972479/get-lines-and-paragraphs-not-symbols-from-google-vision-api-ocr-on-pdf
def extract_paragraph_feature(para_id, para):

    # collect text
    text = ""
    
    # Initialize list of character height of words in paragraph
    wcheight_list = [] 
    breaks = vision.enums.TextAnnotation.DetectedBreak.BreakType
    for word in para.words:
        # Get bounding box coordinates to calculate height word
        cy_list = []
        for v in word.bounding_box.normalized_vertices:
            cy_list.append(v.y)
        # Calculate height of character
        wcheight_list.append(max(cy_list) - min(cy_list))
        for symbol in word.symbols:
            # Append characters to form text
            text += symbol.text
            # Add spaces or linebreaks to text string
            if hasattr(symbol.property, "detected_break"):
                break_type = symbol.property.detected_break.type
                if break_type == breaks.SPACE:
                    text += " "  # if the break is SPACE
                if break_type == breaks.EOL_SURE_SPACE:
                    text += " "  # this is not a line break, why is there detected_break
                if break_type == breaks.LINE_BREAK:
                    text += "\r\n" # if the break is a LINE_BREAK
                    
   #print(np.unique(breaks))
    
    # Average height of words in paragraph
    pcheight = np.average(wcheight_list)
    
    # remove double quotes
    text = text.replace('"', "")

    # remove URLs
    text = re.sub("https?://[\w/:%#\$&\?\(\)~\.=\+\-]+", "", text)

    # extract bounding box features of the paragraph
    x_list = []
    y_list = []
    for v in para.bounding_box.normalized_vertices:
        x_list.append(v.x)
        y_list.append(v.y)
    f = {}
    f["para_id"] = para_id
    f["page"] = para_id[9:12]
    f["text"] = text
    f["avg_word_height"] = pcheight*1000
    f["width"] = max(x_list) - min(x_list)
    f["height"] = max(y_list) - min(y_list)
    f["area"] = f["width"] * f["height"]
    f["chars"] = len(text)
    f["char_size"] = f["area"] / f["chars"] if f["chars"] > 0 else 0
    f["pos_x"] = (f["width"] / 2.0) + min(x_list)
    f["pos_y"] = (f["height"] / 2.0) + min(y_list)
    f["aspect"] = f["width"] / f["height"] if f["height"] > 0 else 0
    f["layout"] = "h" if f["aspect"] > 1 else "v"

    return f

# %%
# Function to form csv file from json response
def build_feature_csv(json_blob, pdf_id, first_page):

    # parse json
    json_string = json_blob
    json_response = json_format.Parse(json_string, vision.types.AnnotateFileResponse())

    # covert the json file to a bag of CSV lines
    csv = ""
    page_count = first_page
    for resp in json_response.responses:
        para_count = 0
        for page in resp.full_text_annotation.pages:

            # collect para features for the page
            page_features = []
            for block in page.blocks:
                if str(block.block_type) != "1":  # process only TEXT blocks
                    continue
                for para in block.paragraphs:
                    para_id = "{}-{:03}-{:03}".format(pdf_id, page_count, para_count)
                    f = extract_paragraph_feature(para_id, para)
                    page_features.append(f)
                    para_count += 1

            # output to csv
            for f in page_features:
                csv += '{},{},"{}",{},{:.6f},{:.6f},{:.6f},{:.6f},{:.6f},{:.6f},{:.6f},{:.6f},{}\n'.format(
                    f["para_id"],
                    f["page"],
                    f["text"],
                    f["chars"],
                    f["avg_word_height"],
                    f["width"],
                    f["height"],
                    f["area"],
                    f["char_size"],
                    f["pos_x"],
                    f["pos_y"],
                    f["aspect"],
                    f["layout"],
                )

        page_count += 1
    return csv


# %%
# Define function to process all files and save csv to file
def process_ocr_text(filename):
    
    # Get pdf id and first page number from file name
    m = re.match("out_([0-9]+)output-([0-9]+)-to-([0-9]+)\.json", filename)
    pdf_id = m.group(1)
    first_page = int(m.group(2))
    last_page  = int(m.group(3))
    
    # Read json source 
    data = json.loads(open('../data/data-gen/json/' + filename).read())
    
    # Convert json to string
    json_blob = json.dumps(data)
    
    # Convert to csv string
    csv_out = build_feature_csv(json_blob, pdf_id, first_page)
    
    return csv_out

# %%
# Read list of files to process
mypath = '../data/data-gen/json'
f = []
for (dirpath, dirnames, filenames) in os.walk(mypath):
    f.extend(filenames)
    break

# %%
# Process all json files
csv_txt = ""

# Concatenate all files into a single string
for fname in f:
    # Process file fname
    csv_out = process_ocr_text(fname)
    # Concatenate strings
    csv_txt += csv_out
    
# Convert to pandas df
colnames = ['id','page','text','chars','avg_word_height','width','height','area','char_size','pos_x','pos_y','aspect','layout']
big_df = pd.read_csv(io.StringIO(csv_txt), names=colnames)



# %%
big_df.shape

# %%
big_df.tail(5)

# %%
# Save big data frame as pickle
big_df.to_pickle('../data/data-gen/big_df.p')

