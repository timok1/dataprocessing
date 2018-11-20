import csv
import json


def write_json(input, output, id):
    with open(input, newline='') as data:
        reader = csv.DictReader(data)
        file_w = open(output, 'w')
        json_list = {}
        headers = reader.fieldnames

        for line in reader:
            child = {}
            for item in headers:
                child[item] = line[item]
            json_list[line[id]] = child

        json.dump(json_list, file_w, indent=2)


if __name__ == "__main__":
    write_json('WorldCupMatches.csv', 'converted_data.json', 'MatchID')
