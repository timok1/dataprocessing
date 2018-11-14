import pandas as pd
import csv
import matplotlib.pyplot as plt
import json


#country = 0, region = 1, popdens = 3, infmor = 7, gdp = 8

def check_csv(input):
    with open(input, newline='\n') as in_csv:
        with open('output.csv', 'w') as out_csv:
            reader = csv.DictReader(in_csv)


            writer = csv.DictWriter(out_csv, fieldnames=['Country', 'Region', pop_dens,inf_mor,gdp])
            writer.writeheader()

            for line in reader:
                # Check country name
                if type(line['Country']) != str or not any(c.isalpha() for c in line['Country']):
                    line['Country'] = 'Unknown Country'

                # Check region name
                if type(line['Region']) != str or not any(c.isalpha() for c in line['Region']):
                    line['Region'] = 'Unknown Region'

                #  Convert pop. dens. to float, if impossible set to 0
                line[pop_dens] = line[pop_dens].replace(',','.')
                try:
                    line[pop_dens] = float(line[pop_dens])
                except:
                    line[pop_dens] = 0

                #  Replace comma's in Infant mortality with periods, convert
                # to float and check
                line[inf_mor] = line[inf_mor].replace(',','.')
                try:
                    line[inf_mor] = float(line[inf_mor])
                except:
                    line[inf_mor] = 0

                #  Convert GDP to int if possible, else set to 0
                line[gdp] = line[gdp].replace(' dollars','')
                try:
                    line[gdp] = int(line[gdp])
                except:
                    line[gdp] = 0

                writer.writerow({'Country': line['Country'], 'Region': line['Region'], pop_dens: line[pop_dens], inf_mor: line[inf_mor], gdp: line[gdp]})
            in_csv.close()
            out_csv.close()

def gdp_calculation(data_dict):
    with open(data_dict, newline='\n') as data:

        df = pd.DataFrame(pd.read_csv(data))
        df_gdp = df.loc[df[gdp] != 0]
        gdp_sum = df_gdp[gdp].sum()
        avg_gdp = gdp_sum / (len(df_gdp))
        gdp_median = df_gdp[gdp].median()
        gdp_mode = df_gdp[gdp].mode()
        gdp_std = df_gdp[gdp].std()

        plt.hist(df_gdp[gdp], bins=100)
        plt.xlabel('GDP per capita')
        plt.ylabel('Number of countries')
        plt.show()
    data.close()

def infmor_calculation(data_dict):
    with open(data_dict, newline='\n') as data:
        df = pd.DataFrame(pd.read_csv(data))
        df_infmor = df.loc[df[inf_mor] != 0]
        infmor_min = df_infmor[inf_mor].min()
        infmor_max = df_infmor[inf_mor].max()
        infmor_quantile = df_infmor[inf_mor].quantile([0.25,0.5,0.75])
        boxplot = df_infmor.boxplot(column=[inf_mor])
        plt.show()

def write_json(data_dict, output):
    with open(data_dict, newline='\n') as data:
        reader = csv.DictReader(data)
        file = open(output,'w', encoding='utf-8')
        for line in reader:
            json.dump(line, file)
            file.write('\n')
        file.close()


if __name__ == "__main__":
    pop_dens = 'Pop. Density (per sq. mi.)'
    inf_mor = 'Infant mortality (per 1000 births)'
    gdp = 'GDP ($ per capita) dollars'

    check_csv('input.csv')
    gdp_calculation('output.csv')
    infmor_calculation('output.csv')
    write_json('output.csv', 'data_json.json')
