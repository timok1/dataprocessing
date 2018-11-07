#!/usr/bin/env python
# Name: Timo Koster
# Student number: 10815716
"""
This script scrapes IMDB and outputs a CSV file with highest rated movies.
"""

import csv
from requests import get
from requests.exceptions import RequestException
from contextlib import closing
from bs4 import BeautifulSoup

TARGET_URL = "https://www.imdb.com/search/title?title_type=feature&release_date=2008-01-01,2018-01-01&num_votes=5000,&sort=user_rating,desc"
BACKUP_HTML = 'movies.html'
OUTPUT_CSV = 'movies.csv'


def extract_movies(dom):
    """
    Extract a list of highest rated movies from DOM (of IMDB page).
    Each movie entry should contain the following fields:
    - Title
    - Rating
    - Year of release (only a number!)
    - Actors/actresses (comma separated if more than one)
    - Runtime (only a number!)
    """

    # ADD YOUR CODE HERE TO EXTRACT THE ABOVE INFORMATION ABOUT THE
    # HIGHEST RATED MOVIES
    # NOTE: FOR THIS EXERCISE YOU ARE ALLOWED (BUT NOT REQUIRED) TO IGNORE
    # UNICODE CHARACTERS AND SIMPLY LEAVE THEM OUT OF THE OUTPUT.

    # Get parts with relevant information
    content=dom.find_all(class_='lister-item-content')

    top50_list = []

    # find relevant information for every movie
    for item in content:
        entry = []
        title = item.a.string
        year = item.find(class_='lister-item-year text-muted unbold').string
        # Remove parentheses from year
        year = year.replace('(','').replace(')','')
        rating = item.find(class_='inline-block ratings-imdb-rating').strong.string
        runtime = item.find(class_='runtime')

        # Runtime might be missing
        if len(runtime) != 0:
            runtime = runtime.string
            runtime = runtime.replace(' min','')
        else:
            runtime = 'Unknown'


        actors = item.find_all('p')[2].find_all('a')
        actors_str = ''

        a_length = len(actors)
        i = 0
        # Ensures actors aren't missing
        if a_length != 0:
            for actor in actors:
                # Exclude director
                if i != 0:
                    # No comma after last actor
                    if i == a_length - 1:
                        actors_str += actor.string
                        break
                    actors_str += actor.string + ', '
                i += 1
        else:
            actors_str = 'Unknown'

        #Add movie info to nested list
        entry.extend((title,rating,year,actors_str,runtime))
        top50_list.append(entry)

    return top50_list


def save_csv(outfile, movies):
    """
    Output a CSV file containing highest rated movies.
    """
    writer = csv.writer(outfile)
    writer.writerow(['Title', 'Rating', 'Year', 'Actors', 'Runtime'])
    for entry in movies:
        writer.writerow(entry)


def simple_get(url):
    """
    Attempts to get the content at `url` by making an HTTP GET request.
    If the content-type of response is some kind of HTML/XML, return the
    text content, otherwise return None
    """
    try:
        with closing(get(url, stream=True)) as resp:
            if is_good_response(resp):
                return resp.content
            else:
                return None
    except RequestException as e:
        print('The following error occurred during HTTP GET request to {0} : {1}'.format(url, str(e)))
        return None


def is_good_response(resp):
    """
    Returns true if the response seems to be HTML, false otherwise
    """
    content_type = resp.headers['Content-Type'].lower()
    return (resp.status_code == 200
            and content_type is not None
            and content_type.find('html') > -1)


if __name__ == "__main__":

    # get HTML content at target URL
    html = simple_get(TARGET_URL)

    # save a copy to disk in the current directory, this serves as an backup
    # of the original HTML, will be used in grading.
    with open(BACKUP_HTML, 'wb') as f:
        f.write(html)

    # parse the HTML file into a DOM representation
    dom = BeautifulSoup(html, 'html.parser')

    # extract the movies (using the function you implemented)
    movies = extract_movies(dom)

    # write the CSV file to disk (including a header)
    with open(OUTPUT_CSV, 'w', newline='') as output_file:
        save_csv(output_file, movies)
