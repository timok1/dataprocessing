import csv
import json


def write_json(input, output, id, league):
    """
    Writes data from a csv file (input) to a json (output). 'id' is the key
    value that is used.
    """

    with open(input, newline='') as data:
        reader = csv.DictReader(data)
        file_w = open(output, 'w')
        json_list = {}
        headers = reader.fieldnames

        # For every line create a key and its attributes.
        for line in reader:
            # Select items from correct league
            if line['League'] == league:
                child = {}
                for item in headers:
                    # Skip id
                    if item != id:
                        child[item] = line[item].replace(',', '')
                json_list[line[id]] = child

        json.dump(json_list, file_w, indent=2)
    data.close()
    file_w.close()


if __name__ == "__main__":
    write_json('Home attendance 2017-18.csv', 'eredivisie_attendance.json', 'Team', 'Eredivisie')
