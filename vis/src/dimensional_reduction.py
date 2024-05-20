from sklearn.manifold import TSNE
import numpy as np
from scipy.spatial.distance import euclidean
from fastdtw import fastdtw
import argparse
import json
import csv
import ast
import re
   

def make_dtw_distance(episode_length, n_dimensions):
        def dtw_distance(x, y):
            # https://pypi.org/project/fastdtw/
            # FastDTW: Toward accurate dynamic time warping in linear time and space.” Intelligent Data Analysis 
            # x = np.array(x)
            # y = np.array(y)
            x = x.reshape((episode_length, n_dimensions))
            y = y.reshape((episode_length, n_dimensions))
            distance, path = fastdtw(x, y, dist=euclidean)
            return distance
        return dtw_distance
    
def convert_to_low_dimensional_data(high_dimensional_data_dict, lower_dimension):
    episode_length = 50
    high_dimensional_data = []
    for i, key in enumerate(high_dimensional_data_dict):
        high_dimensional_data.append(np.array(high_dimensional_data_dict[key][:episode_length]))

    high_dimensional_data = np.array(high_dimensional_data)

    n_dimensions = high_dimensional_data.shape[-1]
    #print(high_dimensional_data.shape)
    #print('n_dimensions:', n_dimensions)

    nsamples = len(high_dimensional_data)
    high_dimensional_data = high_dimensional_data.reshape((nsamples,episode_length*n_dimensions))
    #print(high_dimensional_data.shape)

    tsne = TSNE(n_components=lower_dimension, perplexity=4, metric=make_dtw_distance(episode_length, n_dimensions))
    low_dimensional_data = tsne.fit_transform(high_dimensional_data)
    low_dimensional_data = np.repeat(low_dimensional_data, episode_length, axis=0)
    return low_dimensional_data

def main():
    high_dimensional_data_dict = {}
    original_data_headers = []
    # Parse command-line arguments
    parser = argparse.ArgumentParser()
    parser.add_argument('input_url', type=str)
    parser.add_argument('selected_options', type=str)
    parser.add_argument('n_dimensions', type=int)
    args = parser.parse_args()
    input_url = '../public/logs/log_reacher.csv'
    selected_options = args.selected_options
    selected_options = ast.literal_eval(selected_options)
    selected_options.sort(key=lambda x: int(re.search(r'\d+', x).group()))
    #print('selected_options type:', type(selected_options))
    n_dimensions = args.n_dimensions

    #print('selected_options:', selected_options)

    if n_dimensions != 1 and n_dimensions != 2:
        raise ValueError("n_dimensions must be 1 or 2")
    

    with open(input_url, 'r', newline='') as input_file:
        reader = csv.reader(input_file)
        for row in reader:
            key = row[0]
            if key == "run":
                original_data_headers = row
                if n_dimensions == 1:
                    if '_'.join(selected_options) in original_data_headers:
                        raise ValueError("The selected options already exist in the input file")
                    
                if n_dimensions == 2:
                    if '_'.join(selected_options) + '_x' in original_data_headers and '_'.join(selected_options) + '_y' in original_data_headers:
                        raise ValueError("The selected options already exist in the input file")
                continue
            if key not in high_dimensional_data_dict:
                high_dimensional_data_dict[key] = []
            # drop all columns except the first one and the ones in selected_options
            high_dimensional_data_dict[key].append([float(row[original_data_headers.index(option)]) for option in selected_options])

    # Convert to low dimensional data
    low_dimensional_data = convert_to_low_dimensional_data(high_dimensional_data_dict, n_dimensions)

    if n_dimensions == 1:
        # save the low dimensional data as new column in the input csv file with the header of the selected options separated by '_'
        with open(input_url, 'r', newline='') as input_file:
            reader = csv.reader(input_file)
            rows = list(reader)
            
            rows[0].append('_'.join(selected_options))
            
            for i in range(1, len(rows)):
                rows[i].append(low_dimensional_data[i - 1][0])

        with open(input_url, 'w', newline='') as input_file:
            writer = csv.writer(input_file)
            writer.writerows(rows)

    elif n_dimensions == 2:
        # save the two new columns in the input csv file with the header of the selected options separated by '_' with '_x' and '_y' suffix respectively
        with open(input_url, 'r', newline='') as input_file:
            reader = csv.reader(input_file)
            rows = list(reader)
            
            rows[0].append('_'.join(selected_options) + '_x')
            rows[0].append('_'.join(selected_options) + '_y')
            
            for i in range(1, len(rows)):
                rows[i].append(low_dimensional_data[i - 1][0])
                rows[i].append(low_dimensional_data[i - 1][1])

        with open(input_url, 'w', newline='') as input_file:
            writer = csv.writer(input_file)
            writer.writerows(rows)

    # Print the output as a JSON string
    #print(json.dumps(low_dimensional_data.tolist()))

if __name__ == '__main__':
    main()