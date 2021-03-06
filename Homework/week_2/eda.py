#!/usr/bin/env python
# Name: Timo Koster
# Student number: 10815716

import pandas as pd
import csv
import matplotlib.pyplot as plt
import json

"""
Cleans up the csv file and writes the required info to a new file
"""


def check_csv(input):
    with open(input, newline='\n') as in_csv:
        with open('output.csv', 'w') as out_csv:
            reader = csv.DictReader(in_csv)
            writer = csv.DictWriter(out_csv, fieldnames=([country, region,
                                    pop_dens, inf_mor, gdp]))
            writer.writeheader()

            for line in reader:
                # Check country name
                if type(line[country]) != str or not any(c.isalpha() for c in line[country]):
                    line[country] = 'Unknown Country'
                else:
                    line[country] = line[country].rstrip()

                # Check region name and remove trailing whitespaces
                if type(line[region]) != str or not any(c.isalpha() for c in line[region]):
                    line[region] = 'Unknown Region'
                else:
                    line[region] = line[region].rstrip()

                # Replace comma's in pop. dens. with periods, convert to float,
                # if impossible set to 0
                line[pop_dens] = line[pop_dens].replace(',', '.')
                try:
                    line[pop_dens] = float(line[pop_dens])
                except ValueError:
                    line[pop_dens] = 0

                # Replace comma's in Infant mortality with periods, convert
                # to float and check
                line[inf_mor] = line[inf_mor].replace(',', '.')
                try:
                    line[inf_mor] = float(line[inf_mor])
                except ValueError:
                    line[inf_mor] = 0

                #  Convert GDP to int if possible, else set to 0
                line[gdp] = line[gdp].replace(' dollars', '')
                try:
                    line[gdp] = int(line[gdp])
                except ValueError:
                    line[gdp] = 0

                # Write info to new csv file line by line
                (writer.writerow({country: line[country],
                            region: line[region], pop_dens: line[pop_dens],
                                inf_mor: line[inf_mor], gdp: line[gdp]}))
            in_csv.close()
            out_csv.close()
    return


"""
Calculate mean, median, mode and standard deviation of GDP. Create a histogram
of data.
"""


def gdp_calculation():
    # Create new dataframe for just gdp, ignore 0 values
    df_gdp = df[gdp].loc[df[gdp] != 0]

    # Calculate average, median, mode and standard deviation
    gdp_sum = df_gdp.sum()
    avg_gdp = gdp_sum / (len(df_gdp))
    gdp_median = df_gdp.median()
    gdp_mode = df_gdp.mode()
    gdp_std = df_gdp.std()

    # Create histogram
    plt.hist(df_gdp, bins=100)
    plt.xlabel('GDP per capita')
    plt.ylabel('Number of countries')
    plt.show()

    return avg_gdp, gdp_median, gdp_mode, gdp_std


"""
Calculate five number summary of infant mortality, creates a boxplot of
data
"""


def infmor_calculation():
    # Create new dataframe for just inf_mor, ignore 0 values
    df_infmor = df[inf_mor].loc[df[inf_mor] != 0]

    # Calculate five number summary
    infmor_min = df_infmor.min()
    infmor_max = df_infmor.max()
    infmor_quantiles = df_infmor.quantile([0.25, 0.5, 0.75])
    infmor_first = infmor_quantiles[0.25]
    infmor_median = infmor_quantiles[0.5]
    infmor_third = infmor_quantiles[0.75]
    L_fns = [infmor_min, infmor_first, infmor_median, infmor_third, infmor_max]

    # Create boxplot of inf_mor
    df.loc[df[inf_mor] != 0].boxplot(column=[inf_mor])
    plt.show()

    return L_fns


"""
Create a json file from data.
"""


def write_json(data_dict, output):
    with open(data_dict, newline='\n') as data:
        reader = csv.DictReader(data)
        file = open(output, 'w')
        json_list = {}
        for line in reader:
            json_list[line[country]] = {
                region: line[region],
                pop_dens: line[pop_dens],
                inf_mor: line[inf_mor],
                gdp: line[gdp]
            }
        json.dump(json_list, file, indent=4)

    file.close()
    data.close()

    return


if __name__ == "__main__":
    country = 'Country'
    region = 'Region'
    pop_dens = 'Pop. Density (per sq. mi.)'
    inf_mor = 'Infant mortality (per 1000 births)'
    gdp = 'GDP ($ per capita) dollars'

    check_csv('input.csv')

    # Create dataframe of data
    with open('output.csv', newline='\n') as data:
        df = pd.DataFrame(pd.read_csv(data))
    data.close()

    gdp_calculation()
    infmor_calculation()
    write_json('output.csv', 'data_json.json')
