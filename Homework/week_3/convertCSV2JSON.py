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
                if item != id:
                    child[item] = line[item]
            json_list[line[id]] = child

        json.dump(json_list, file_w, indent=2)
    data.close()
    file_w.close()


if __name__ == "__main__":
    write_json('ice.csv', 'converted_data.json', 'DOY')
