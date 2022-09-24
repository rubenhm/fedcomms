# Preliminaries:
# Google Cloud 
# + Initiate a new project 
# + Create a storage bucket 
# + Activate the Vision API 

all:  charts 

# Beige book (html files)
R/organize_beige_book.R: R/download_beige_book.R
	cd R 
	R CMD BATCH download_beige_book.R

data/data-gen/sent_beigebook.p: R/organize_beige_book.R
	cd R 
	R CMD BATCH organize_beige_book.R

# Minutes and SEPs (pdf files)
R/select_minutes_with_sep.R : R/download_fomc_minutes.R
	cd R
	R CMD BATCH download_fomc_minutes.R 

pdfs: R/select_minutes_with_sep.R 
	cd R
	R CMD BATCH download_fomc_minutes.R 
	R CMD BATCH select_minutes_with_sep.R

# Movie Reviews (direct from API into pickle file2022-)
data/data-gen/sent_movies.p: R/download_and_process_movies.R
	cd R
	R CMD BATCH download_and_process_movies.R

# Upload selected pdf files to storage bucket
storage: pdfs
	gsutil storage cp data/minutes_sep/* gs://fomc-files/pdfs

code/gcompfiles.sh: storage

# Obtain json files (output from google API)
jsons: code/gcompfiles.sh
	cd code
	bash gcompfiles.sh

# Process OCR results and store text in pickle file
python/Process_ocr_results.ipynb: jsons

R/organize_paragraphs.R: data/data-gen/big_df.p

data/data-gen/big_df.p: python/Process_ocr_results.ipynb
	cd python
	jupyter nbconvert --to notebook --inplace --execute Process_ocr_results.ipynb

data/data-gen/sent_minutes.p data/data-gen/sent_seps.p: R/organize_paragraphs.R 
	cd R 
	R CMD BATCH organize_paragraphs.R

python/Process_ocr_results.ipynb: jsons
	cd python
	jupyter nbconvert --to notebook --inplace --execute  Process_ocr_results.ipynb


# Calculate similarities
python/Calculate_similarites.ipynb: data/data-gen/sent_beigebook.p data/data-gen/sent_minutes.p data/data-gen/sent_seps.p data/data-gen/sent_movies.p

similarities: python/Calculate_similarites.ipynb 
	cd python
	jupyter nbconvert --to notebook --inplace --execute Calculate_similarites.ipynb

# Generate results charts
R/plot_results.R: similarities

charts: R/plot_results.R 
	cd R 
	R CMD bash plot_results.R 


