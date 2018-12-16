# Timo Koster, 10815716

import csv
import json


def write_json(drivers, teams, results, output):
    """
    Writes data from a csv file (input) to a json (output). 'id' is the key
    value that is used.
    """

    with open(drivers, encoding="utf8") as drivers_data, open(results) as results_data, open(teams, encoding="utf8") as teams_data:
        reader_drivers = csv.DictReader(drivers_data)
        reader_results = csv.DictReader(results_data)
        reader_teams = csv.DictReader(teams_data)
        country_data = json.load(open('data/countries.json'))
        file_w = open(output, 'w')
        json_list = {}
        # Write json driver by driver
        for driver in reader_drivers:
            n_victories = 0
            teams = {}
            results_data.seek(0)
            # Check for victories
            for result in reader_results:
                if (driver['driverId'] == result['driverId'] and
                        result['position'] == '1'):
                    n_victories += 1
                    # Count victories per team
                    try:
                        teams[result['constructorId']] += 1
                    except KeyError:
                        teams[result['constructorId']] = 1
            # Only keep race winners
            if n_victories > 0:
                # Copy to not mess up for-loop
                teams_copy = teams.copy()
                for team in teams_copy:
                    teams_data.seek(0)
                    # Change team id to team name
                    for item in reader_teams:
                        if item['constructorId'] == team:
                            teams[item['name']] = teams.pop(item['constructorId'])
                            break
                child = {}
                child['nationality'] = driver['nationality']
                child['victories'] = n_victories
                child['teams'] = teams
                # Get country id from nationality
                for item in country_data:
                    # Don't let French territories mess this up
                    if driver['nationality'] == 'French':
                        child['country_id'] = 'FRA'
                    elif item['demonym'] == driver['nationality']:
                        child['country_id'] = item['cca3']
                name = driver['forename'] + ' ' + driver['surname']
                json_list[name] = child

        json.dump(json_list, file_w, indent=2)

    drivers_data.close()
    teams_data.close()
    results_data.close()
    file_w.close()


if __name__ == "__main__":
    write_json('data/drivers.csv', 'data/constructors.csv', 'data/results.csv', 'data/race_winners.json')
