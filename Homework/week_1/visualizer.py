#!/usr/bin/env python
# Name: Timo Koster
# Student number: 10815716
"""
This script visualizes data obtained from a .csv file
"""

import csv
import matplotlib.pyplot as plt

# Global constants for the input file, first and last year
INPUT_CSV = "movies.csv"
START_YEAR = 2008
END_YEAR = 2018


# Calculate average rating for given year
def avg_rating(year):
    with open(INPUT_CSV, newline='') as in_csv:
        line_count = 0
        year = str(year)
        movies = csv.reader(in_csv)
        n = 0
        tot_score = 0
        #Find all movies for given year, and add score to total score
        for item in movies:
            if line_count != 0 and item[2] == year:
                score = float(item[1])
                tot_score = tot_score + score
                n += 1
            line_count += 1
        avg = round(tot_score / n, 2)
    return avg


# Global dictionary for the data
data_dict = {}
for year in range(START_YEAR, END_YEAR):
    data_dict[year] = avg_rating(year)

if __name__ == "__main__":

    #Create plot of data
    x = []
    y = []
    for i, j in data_dict.items():
        x.append(i)
        y.append(j)
    plt.plot(x,y,'r')
    plt.xlabel('Year')
    plt.ylabel('Average Rating')
    plt.xticks(range(START_YEAR, END_YEAR))
    plt.title('Average ratings of movies in IMDB top 50 (2008-2017) by year')
    plt.show()
