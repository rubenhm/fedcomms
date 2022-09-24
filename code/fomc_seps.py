# Download data to draw the FOMC SEP charts.
#
# Strategy:
# Visit the main page: url = u'https://www.federalreserve.gov/monetarypolicy/fomccalendars.htm'
# Find the url for the most recent SEPs.
# Collect the data and save to CSV

import pandas as pd
import numpy as np
import bs4
import requests
import datetime
import re
from fredapi import Fred
from operator import methodcaller
import os

api_key = os.getenv('FRED_API_KEY')
fred = Fred(api_key= api_key)

# Main url
url = u'https://www.federalreserve.gov/monetarypolicy/fomccalendars.htm'

# Download calendar file
# res = requests.get(url, proxies=proxies)
res = requests.get(url)
# Check for errors
try:
    res.raise_for_status()
except Exception as exc:
    print('There was a problem: %s' % (exc))

# Make the soup
soup = bs4.BeautifulSoup(res.text, 'lxml')

# Find calendar years.
divs = soup.select('.panel.panel-default')

# Find current year: will work after March meeting.
today = datetime.date.today()
# Have to identify the most recent SEP
# Recover March meeting date and compare with today
march_date = divs[0].find_all("div",{"class": "fomc-meeting__date col-xs-4 col-sm-9 col-md-10 col-lg-1"})[1].text
# extract substring of March date corresponding to press release date
# assumes two-day meeting
mar_date = int(march_date[3:-1])
if ( (today.month < 3) | ( (today.month == 3) & (today.day < mar_date) ) ):
    curr_year= divs[1].findAll("div", {"class": "fomc-meeting--shaded row fomc-meeting"})
else:
    curr_year= divs[0].findAll("div", {"class": "fomc-meeting--shaded row fomc-meeting"})
# print(curr_year)
# print(range(len(curr_year)))

# Examine the most recent table
# search for pattern of html elements with projection materials
seps = []
for i in range(len(curr_year)-1,-1,-1):
    result = (curr_year[i].find_all("a", string="HTML"))
    for j in range(len(result)):
        print("result is = %s" % result[j]['href'])
        match = re.search('fomcprojtabl',result[j]['href'])
        if match:
            print("matched word is = %s" % match.group(0))
            print("test string is = %s" %  result[j]['href'])
            suburl = result[j]['href']
            print("suburl is %s" %  suburl)
            seps.append(suburl)
            break

# Extract the most recent release date
sep_date = seps[0].split("/")[-1].split(".")[0].split("fomcprojtabl")[-1]
print("The most recent SEPs are from: %s" % (sep_date))

# Write date to file
# http://stackoverflow.com/questions/5214578/python-print-string-to-text-file
text_file = open("data/sep_latest_date.csv", "w")
text_file.write("date\n")
text_file.write(sep_date)
text_file.close()

# Form suburl to extract data from html tables
dataurl = u'https://www.federalreserve.gov' + seps[0]

# Retrieve data webpage
datares = requests.get(dataurl)
# Check for errors
try:
    datares.raise_for_status()
except Exception as exc:
    print('There was a problem: %s' % (exc))

# Make the soup
datasoup = bs4.BeautifulSoup(datares.text, 'lxml')
# Collect the tables
datatables = datasoup.select('table[class="pubtables"]')


# Define function to parse tables 1, 2, 3
def parse_table(table):
    bdata = []
    # Parse header
    rows = table.find('thead').find_all('tr')
    colh = [th.getText().replace(u'\xa0',u' ').encode('utf-8') for th in rows[0].find_all('th')]
    cols = [ele for ele in colh]
    cols = ['index'] + [ele.decode('utf-8') for ele in colh]
    # print(cols)
    bdata.append(cols)
    # Parse body
    rows = table.find('tbody').find_all('tr')
    for row in rows:
        # Find column headers
        # Remove unicode character for non-breaking space
        # http://stackoverflow.com/questions/10993612/python-removing-xa0-from-string
        colh = [th.getText().replace(u'\xa0', u' ').encode('utf-8') for th in row.find_all('th')]
        
        # Find row values
        colb = [td.getText() for td in row.find_all('td')]
        # Concatenate list and list of lists
        cols = [ele.decode('utf-8') for ele in colh]+[ele for ele in colb]
        print(cols)
        bdata.append(cols)
    # transpose list of lists
    # http://stackoverflow.com/questions/6473679/transpose-list-of-lists
    bdata = list(map(list, zip(*bdata)))
    # Form data frame
    df = pd.DataFrame(bdata[1:], columns=bdata[0])
    df = df
    df.set_index('index', inplace=True)
    df = df.replace('-', '')
    return df


# Define function to parse table 4 (the dotplot)
def parse_dot_table(table):
    # Parse rows
    bdata = []
    rows = table.find_all('tr')
    for row in rows:
        # find first column header
        cols0 = row.find_all('th')
        cols0 = [ele.text.strip() for ele in cols0]
        # find other columns
        cols = row.find_all('td')
        cols = [ele.text.strip() for ele in cols]
        cols = [ele for ele in cols0]+[ele for ele in cols]
        bdata.append(cols)
    # Convert to DataFrame
    bdata[0][0] = "Midpoint"
    bdata[0][-1] = "Longer Run"
    df = pd.DataFrame(bdata[1:], columns=bdata[0])
    df.set_index("Midpoint", inplace=True)
    # Prepare to write data to json file
    # http://stackoverflow.com/questions/28590663/pandas-dataframe-to-json-without-index
    dfsize = df.shape
    for rows in range(0, dfsize[0]):
        for cols in range(0, dfsize[1]):
            count = df.iloc[rows, cols]
            if count:
                array = range(1, int(count)+1)
            else:
                array = [0]
            df.iat[rows, cols] = [*array]
    return df

# Process tables 1,2,3 only and write to CSV
df_gdp = parse_table(datatables[1])
df_gdp.to_csv('data/SEP_GDP.CSV')
df_ur = parse_table(datatables[2])
df_ur.to_csv('data/SEP_UR.CSV')
df_pce = parse_table(datatables[3])
df_pce.to_csv('data/SEP_PCE.CSV')

# Process table 4 and write to JSON
df_ff = parse_dot_table(datatables[5])
df_ff.transpose().reset_index().to_json("data/DOTPLOT.JSON", orient='records')


# Define function to create df from list of variables
# downloaded from Fred
def createFredDataFrame(varlist, **kwargs):
    df = {}
    for var in varlist:
        if kwargs.keys():
            df[var] = fred.get_series(var, **kwargs)
        else:
            df[var] = fred.get_series(var)
    df = pd.DataFrame(df)
    df.index.rename("DATE", inplace=True)
    return df


# Download ff data from table 0 of SEP to generate box plot
# Define function to process table 0
def parse_ffr_table0(table, varidx, actual):
    bdata = []
    # Parse header
    rows = table.find('thead').find_all('tr')
    colh = {}
    colh[0] = [th.getText().replace(u'\xa0',u' ').encode('utf-8') for th in rows[0].find_all('th')]
    colh[1] = [th.getText().replace(u'\xa0',u' ').encode('utf-8') for th in rows[1].find_all('th')]
    cols = {}
    cols[0] = ['index'] + [ele for ele in colh[0]]
    cols[1] = ['index'] + [ele for ele in colh[1]]
    #     cols = [ele for ele in colh]
    #     cols[0] = "index"
    bdata.append(cols)
    # Parse body
    rows = table.find('tbody').find_all('tr')
    for row in rows:
        # Find column headers
        # Remove unicode character for non-breaking space
        # http://stackoverflow.com/questions/10993612/python-removing-xa0-from-string
        colh = [th.getText().replace(u'\xa0',u' ').encode('utf-8') for th in row.find_all('th')]
        # Find row values
        colb = [td.getText() for td in row.find_all('td')]
        # Concatenate list and list of lists
        cols = [ele for ele in colh]+[ele for ele in colb]
        bdata.append(cols)
    # Extract median
    md = np.array(bdata[varidx][1:6] )
    #print(md)
    # https://stackoverflow.com/questions/8461230/python-map-string-split-list
    # Extract central tendency
    ct = list(map(methodcaller("split",u'\xe2\x80\x93'),bdata[varidx][6:11]))
    #print(ct)
    # Extract range
    rg = list(map(methodcaller("split",u'\xe2\x80\x93'),bdata[varidx][11:16]))
    #print(rg)
    # Organize variables as [rg_l,ct_l,md,ct_u,rg_u]
    # https://docs.scipy.org/doc/numpy-1.13.0/reference/generated/numpy.concatenate.html#numpy.concatenate
    unsorted = np.concatenate(([md], np.concatenate((np.array(ct).T,np.array(rg).T),axis=0)),axis=0).T
    #print(unsorted)
    # https://stackoverflow.com/questions/20265229/rearrange-columns-of-numpy-2d-array
    sorted_array = unsorted[:,[3,1,0,2,4]]
    #print(sorted_array)
    # Concatenate with actual to form data for export
    # Actual
    # Need a matrix of 5 nans at the end
    n5 = np.reshape(np.repeat(np.nan, 25), (5, 5))
    act = np.concatenate((actual, n5), axis=1)[:, 2:]
    # Concatenate AT,CT,RG
    # CT and RG
    # Add nans to sorted array
    n5 = np.repeat([np.repeat(np.nan,5)], 1 , axis=0)
    ffsep = np.concatenate((n5.T,sorted_array), axis=1)
    # Concatenate AT,CT,RG
    data = np.concatenate((act,ffsep),axis=0)
    # Construct index array
    index = [a.decode("utf-8") for a in bdata[0][1][1:6]]
    # Add labels for actual
    fullindex = [[str(i) for i in range(int(index[0])-5,int(index[0]))] + index]
    # Colnames
    colnames = ["Actual","Lower End of Range","Lower End of Central Tendency","Median","Upper End of Central Tendency","Upper End of Range"]
    # form data frame
    df = pd.DataFrame(index= fullindex, data=data, columns = colnames)
    # Replace nans with empty string
    df = df.replace(u'nan','')
    # Set the index name
    # https://stackoverflow.com/questions/18022845/pandas-index-column-title-or-name
    df.index.name = "index"
    return df

# Download actual data for FFR
cur_year = today.year
start = datetime.datetime(cur_year-5, 12,31)
end = datetime.datetime(cur_year-1,12,31)
kargs = {'observation_start': start, 'observation_end': end, 'frequency': 'a', 'aggregation_method': 'eop'}
# Download FFR limits
ffr_limits = createFredDataFrame(["DFEDTARL","DFEDTARU"],**kargs)
# Calculate midpoint
ffr_limits["Midpoint"] = (ffr_limits["DFEDTARL"] + ffr_limits["DFEDTARU"])/2
# Convert midpoint to numpy array
# https://stackoverflow.com/questions/31789160/convert-select-columns-in-pandas-dataframe-to-numpy-array
print(ffr_limits)
actual = ffr_limits.iloc[:, :].to_numpy()
print(actual)
# Construct data for export
df_ffr = parse_ffr_table0(datatables[0],10, actual)
df_ffr.to_csv("data/SEP_FFR.CSV", index_label="index")

