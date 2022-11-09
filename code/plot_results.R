library(dplyr)
library(tidyr)
library(ggplot2)
library(ggrepel)
library(ggthemes)
library(reticulate)


# Select python environment
# use_condaenv(condaenv = 'base', conda = 'C:\\Users\\ruben\\anaconda3\\Scripts\\conda.exe')
use_python("c:/Users/HERNAR2/Developer tools/WPy64-3890/python-3.8.9.amd64/python.exe")

# Read pickle files
pd <- import("pandas")
df_cosine <- pd$read_pickle("data/df_cosine.p")


# Define chart theme ------------------------------------------------------
{
titlecolor = '#3a6f8f' # RGB 58 111 143 (for font)
fontcolor = '#414B56'  # RGB 65 75 86
top_left_chart_title_theme = function(font_size = 18, title_color = titlecolor, font_color = fontcolor) {
  ggplot2::theme(plot.title = ggplot2::element_text(size = font_size + 2, face = "bold", color = titlecolor, hjust = 0, vjust = 0),
                 plot.subtitle = ggplot2::element_text(size = font_size, face = "bold", color = fontcolor, hjust = 0, vjust = 0),
                 plot.caption = ggplot2::element_text(color = 'black', size = font_size - 6, hjust = 0, vjust = 0),
                 plot.background = ggplot2::element_blank(),
                 panel.background = ggplot2::element_blank(),
                 axis.text.x = element_text(size = font_size - 2),
                 axis.text.y = element_text(size = font_size),
                 axis.ticks.length = unit(.25, "cm")
  )
  }
}


# Prepare data for charts -------------------------------------------------

# Make date variable
df_cosine <- df_cosine %>%
  mutate(date = as.Date(doc_id, format = "%Y%m%d"))

# Make data long format
df_chart_cosine <- df_cosine %>%
  select(-doc_id) %>%
  pivot_longer(cols = -c(date), names_prefix = "cosine_", values_to = "similarity") %>%
  mutate( docs = case_when(
    name == "min_sep"  ~ "Minutes — SEP",
    name == "min_beb"  ~ "Minutes — Beige Book",
    name == "min_mov"  ~ "Minutes — Movie Summaries",
    name == "sep_beb"  ~ "SEP — Beige Book",
    name == "sep_mov"  ~ "SEP — Movie Summaries",
    name == "beb_mov"  ~ "Beige Book — Movie Summaries"
  )) %>% select(-name)


short_fmt <- function(x) {
  sprintf("%3.2f",x)
}

date_fmt <- function(x) {
  format(x,"%m/%d/%y")
}


dates <- df_chart_cosine$date %>% unique()

# Labels
df_chart_cosine$docs <- stringr::str_replace(df_chart_cosine$docs, 'e Summaries', 'es')
df_chart_cosine <- df_chart_cosine %>% 
  group_by(docs) %>%
  mutate(
    label = ifelse(date == max(date), docs, NA_character_)
  ) %>%
  ungroup()
  



# Cosine similarity -------------------------------------------------------

{
  
  p.cosine.fomc <- df_chart_cosine %>% 
    filter( !stringr::str_detect(docs,'Movie') ) %>%
  
    ggplot(aes(x = date, y = similarity, color = docs)) +
    geom_hline(yintercept = 0.50, linetype = "dashed", color = "black", size = 1.5) +
    geom_line(aes(group = docs),size = 3) +
    geom_vline(xintercept = as.Date("2016-12-14"), 
                linetype="dotted",
                color = "#57575e") +
    geom_label_repel(aes(label = label), 
                     hjust = -0.5,
                     fontface = 2,
                     label.size = NA,
                     size = 5,
                     na.rm = TRUE) +
    annotate(geom = "text", label = "12/14/17",
            hjust = 0, color = "#57575e", size = 6,
             x = as.Date("2016-12-14"), y = 0.10) +
    labs(
      title = "Semantic Similarity among the FOMC Minutes, Summary of Economic Projections, \nand the Beige Book",
      subtitle = "Cosine similarity between pairs of document embeddings",
      x = "",
      y = ""
    ) +
    scale_x_date(breaks = dates[seq(from = 1, by = 4, to = NROW(dates))], 
                 labels = date_fmt,
                 expand = expansion(mult = c(0, 0.2)) )+ 
    scale_y_continuous(breaks = seq(from = 0.0, to = 1, by = 0.1), 
                       labels = short_fmt, limits = c(0, 1)) +
    scale_colour_tableau(palette = "Tableau 10") + 
    theme_light() +
    top_left_chart_title_theme() +
    theme(
      panel.border = element_blank(),
      panel.grid.major.x = element_blank(),
      panel.grid.minor.x = element_blank(),
      panel.grid.major.y = element_line(linetype = "dashed"),
      panel.grid.minor.y = element_blank(),
      legend.position = "none"
    ) 
  
  ggsave(filename = 'images/plot_cosine_fomc.png', plot = p.cosine.fomc, width = 16, height = 9)

  p.cosine.movies <- df_chart_cosine %>% 
    filter( stringr::str_detect(docs,'Movie') ) %>%
    ggplot(aes(x = date, y = similarity, color = docs)) +
    geom_hline(yintercept = 0.50, linetype = "dashed", color = "black", size = 1.5) +
    geom_line(aes(group = docs), size = 3) +
    geom_vline(xintercept = as.Date("2016-12-14"),
                linetype="dotted",
                color = "#57575e") +
    geom_label_repel(aes(label = label), 
                     hjust = -0.5,
                     fontface = 2,
                     label.size = NA,
                     size = 5,
                     na.rm = TRUE) +
    annotate(geom = "text", label = "12/14/17",
            hjust = 0, color = "#57575e", size = 6,
            x = as.Date("2016-12-14"), y = 0.90) +
    labs(
      title = "Semantic Similarity between the FOMC Minutes, Summary of Economic Projections, \nthe Beige Book, and Movie Summaries",
      subtitle = "Cosine similarity between pairs of document embeddings",
      x = "",
      y = ""
    ) +
    scale_x_date(breaks = dates[seq(from = 1, by = 4, to = NROW(dates))], 
                 labels = date_fmt,
                 expand = expansion(mult = c(0, 0.2)) ) + 
    scale_y_continuous(breaks = seq(from = 0.0, to = 1, by = 0.1), 
                       labels = short_fmt, limits = c(0,1)) +
    scale_colour_tableau(palette = "Classic Green-Orange 6") + 
    theme_light() +
    top_left_chart_title_theme() +
    theme(
      panel.border = element_blank(),
      panel.grid.major.x = element_blank(),
      panel.grid.minor.x = element_blank(),
      panel.grid.major.y = element_line(linetype = "dashed"),
      panel.grid.minor.y = element_blank(),
      legend.position = "none"
    ) 
  
  ggsave(filename = 'images/plot_cosine_movies.png', plot = p.cosine.movies, width = 16, height = 9)
  
}



