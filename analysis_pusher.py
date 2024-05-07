import os
import shutil
import gymnasium as gym
from gymnasium.wrappers import RecordVideo
import imageio
from stable_baselines3.common.monitor import Monitor
from stable_baselines3 import PPO, SAC
import matplotlib.pyplot as plt
import imageio
import threading
from tqdm import tqdm
import csv
import json
from scipy.spatial.distance import euclidean
from fastdtw import fastdtw
import numpy as np
from sklearn.manifold import TSNE
import pandas as pd
from envs.record_info_dict import InfoDictWrapper

def gen_trajectories():
    total_timesteps = 5000

    video_path_root = './vis/public/videos_pusher/'
    if os.path.exists(video_path_root):
        shutil.rmtree(video_path_root)
    os.makedirs(video_path_root)
    image_path_root = './vis/public/images_pusher/'
    if os.path.exists(image_path_root):
        shutil.rmtree(image_path_root)
    os.makedirs(image_path_root)
    gif_path = './vis/public/gifs_pusher/'
    if os.path.exists(gif_path):
        shutil.rmtree(gif_path)
    os.makedirs(gif_path)
    file_path = './vis/public/logs/log_pusher.csv'
    if os.path.isfile(file_path):
        os.remove(file_path)

    print("Step 1: gen_trajectories")
    # train a new SAC model and save the trajectories of the training
    env = gym.make(
        "Pusher-v4",
        render_mode="rgb_array"
    )

    # wrap the environment
    env = RecordVideo(env, video_path_root, name_prefix="training", episode_trigger=lambda x: x % 1 == 0) 
    env = InfoDictWrapper(env)

    if not os.path.exists("outputs/pusher_conventional_ppo_1.zip"):
        print("Training new model")
        model = PPO("MlpPolicy", env, verbose=1, batch_size=32, n_steps=512, gamma=0.9, learning_rate=0.000104019, ent_coef=7.52585e-08, clip_range=0.3, n_epochs=5, gae_lambda=1.0, max_grad_norm=0.9, vf_coef=0.950368)
    else:
        print("Loading existing model")
        model = PPO.load("outputs/pusher_conventional_ppo_1")
        model.set_env(env)

    model.learn(total_timesteps=total_timesteps)
    model.save("outputs/pusher_conventional_ppo_1")

    # Access the replay buffer
    infoDict = env.info_dict
    #env.close() # <- this line is causing "Segmentation fault"

    file_prefix = 'training-episode-'
    # iterate through each run from the training saved in the replay buffer
    with open(file_path, 'a') as f:
        f.write('run,id,ob0,ob1,ob2,ob3,ob4,ob5,ob6,ob7,ob8,ob9,ob10,ob11,ob12,ob13,ob14,ob15,ob16,ob17,ob18,ob19,ob20,ob21,ob22,a0,a1,a2,a3,a4,a5,a6,r\n')
        for episode_id in range(len(infoDict)):
            episode = infoDict[episode_id]
            # save the trajectories into a csv file
            print("saving trajectory", episode_id, "of", len(infoDict))
            t = 0
            for time_step in episode:
                obs = time_step['obs']
                actions = time_step['action']
                rewards = time_step['reward']
                f.write(str(episode_id) + ',' + str(t) + ',' + ','.join([str(x) for x in obs]) + ',' + ','.join([str(x) for x in actions]) + ',' + str(rewards) + '\n')
                t += 1

            # extract the images from the videos and save them into a folder
            print("saving video", episode_id, "of", len(infoDict))
            video_path = video_path_root + file_prefix  + str(episode_id) + '.mp4'
            try:
                vid = imageio.get_reader(video_path,  'ffmpeg')
                for num, image in enumerate(vid.iter_data()):
                    imageio.imwrite(image_path_root + file_prefix  + str(episode_id) + '_' + str(num) + '.png', image)
                # save the videos recorded with the RecordVideoWrapper into gifs
                print("saving gif", episode_id, "of", len(infoDict))
                gif_path = './vis/public/gifs_pusher/training-episode-' + str(episode_id) + '.gif'
                with imageio.get_writer(gif_path, mode='I') as writer:
                    for filename in os.listdir(image_path_root):
                        if filename.startswith(file_prefix  + str(episode_id)):
                            image = imageio.imread(image_path_root + filename)
                            writer.append_data(image)
            except:
                print("skip")

    # free up memory
    del model
    del env


def embedding():
    print("Step 2: embedding")
    csv_file = './vis/public/logs/log_pusher.csv'
    observation_env_dict = {}
    observation_agt_dict = {}
    reward_dict = {}
    episode_length = 50

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
        n_dimensions = len(high_dimensional_data_dict[list(high_dimensional_data_dict.keys())[0]][0])
        print('n_dimensions:', n_dimensions)
        high_dimensional_data = []
        for i, key in enumerate(high_dimensional_data_dict):
            behavior_points.append({
                "key": key,
                "r": reward_dict[key] # normalized return # / (float(w1)+float(w2)+0.01)
            })
            high_dimensional_data.append(np.array(high_dimensional_data_dict[key][:episode_length]))

        high_dimensional_data = np.array(high_dimensional_data)

        print(high_dimensional_data.shape)

        nsamples = len(high_dimensional_data)
        high_dimensional_data = high_dimensional_data.reshape((nsamples,episode_length*n_dimensions))
        print(high_dimensional_data.shape)

        tsne = TSNE(n_components=lower_dimension, perplexity=4, metric=make_dtw_distance(episode_length, n_dimensions))
        low_dimensional_data = tsne.fit_transform(high_dimensional_data)
        return low_dimensional_data


    with open(csv_file, 'r', newline='') as input_file:
        reader = csv.reader(input_file)
        for row in reader:
            key = row[0]
            if key == "run": continue # skip first row
            if key not in observation_env_dict:
                observation_env_dict[key] = []
                observation_agt_dict[key] = []
            if key not in reward_dict:
                reward_dict[key] = 0
            observation_env_dict[key].append([
                float(row[19]),
                float(row[20]),
                float(row[21]),
                float(row[22]),
                float(row[23]),
                float(row[24]),
            ])
            observation_agt_dict[key].append([
                float(row[2]),
                float(row[3]),
                float(row[4]),
                float(row[5]),
                float(row[6]),
                float(row[7]),
                float(row[8]),
                float(row[9]),
                float(row[10]),
                float(row[11]),
                float(row[12]),
                float(row[13]),
                float(row[14]),
                float(row[15]),
                float(row[16]),
                float(row[17]),
                float(row[18]),
            ])
            reward_dict[key] += float(row[32])

    behavior_points = []

    low_dimensional_data_env = convert_to_low_dimensional_data(observation_env_dict, 1)
    low_dimensional_data_agt = convert_to_low_dimensional_data(observation_agt_dict, 1)


    for i in range(len(low_dimensional_data_env)):
        behavior_points[i]["x"] = float(low_dimensional_data_env[i])
        behavior_points[i]["y"] = float(low_dimensional_data_agt[i])

    print(behavior_points)

    # x = np.array(behavior_dict["0.0-1.0"])
    # y = np.array(behavior_dict["1.0-1.0"])
    # distance, path = fastdtw(x, y, dist=euclidean)

    # print(distance)

    with open('./vis/public/logs/embedding_pusher.json', 'w') as f:
        json.dump(behavior_points, f)

    # Add embedding into log
    embedding_list = behavior_points
    embedding_dict = {}
    for embedding in embedding_list:
        print(embedding)
        if "x" not in embedding or "y" not in embedding: continue
        embedding_dict[embedding["key"]] = {}
        embedding_dict[embedding["key"]]["x"] = embedding["x"]
        embedding_dict[embedding["key"]]["y"] = embedding["y"]

    csv_file = './vis/public/logs/log_pusher.csv'

    rows_with_embedding = []

    with open(csv_file, 'r', newline='') as input_file:
        reader = csv.reader(input_file)

        _ = next(reader)  # Read the first row

        # Read and process each subsequent row
        for row in reader:
            key = row[0]
            row_with_embedding = ','.join(row) + "," + str(embedding_dict[key]["x"]) + "," + str(embedding_dict[key]["y"]) + "\n"
            # print(row_with_embedding)
            rows_with_embedding.append(row_with_embedding)

    file_path = './vis/public/logs/log_pusher_embedding.csv'
    if os.path.isfile(file_path):
        os.remove(file_path)
    with open(file_path, 'a') as f:
        f.write('run,id,ob0,ob1,ob2,ob3,ob4,ob5,ob6,ob7,ob8,ob9,ob10,ob11,ob12,ob13,ob14,ob15,ob16,ob17,ob18,ob19,ob20,ob21,ob22,a0,a1,a2,a3,a4,a5,a6,r,x,y\n')
        for row in rows_with_embedding:
            f.write(row)

def keyframes():
    print("Step 3: keyframes")
    def has_zero_crossing(prev_row, current_row):
        try:
            if float(prev_row[25]) * float(current_row[25]) < 0 and abs(float(prev_row[25]) - float(row[25])) > 0.5: return True
            if float(prev_row[26]) * float(current_row[26]) < 0 and abs(float(prev_row[26]) - float(row[26])) > 0.5: return True
            if float(prev_row[27]) * float(current_row[27]) < 0 and abs(float(prev_row[27]) - float(row[27])) > 0.5: return True
            if float(prev_row[28]) * float(current_row[28]) < 0 and abs(float(prev_row[28]) - float(row[28])) > 0.5: return True
            if float(prev_row[29]) * float(current_row[29]) < 0 and abs(float(prev_row[29]) - float(row[29])) > 0.5: return True
            if float(prev_row[30]) * float(current_row[30]) < 0 and abs(float(prev_row[30]) - float(row[30])) > 0.5: return True
            if float(prev_row[31]) * float(current_row[31]) < 0 and abs(float(prev_row[31]) - float(row[31])) > 0.5: return True
        except:
            print("skip")
        return False

    csv_file = './vis/public/logs/log_pusher.csv'

    keframe_dict = {}

    with open(csv_file, 'r', newline='') as input_file:
        reader = csv.reader(input_file)

        prev_row = next(reader)  # Read the first row

        # Read and process each subsequent row
        for row in reader:
            flagged = has_zero_crossing(prev_row, row)
            if flagged:
                print(row[4]) # id
                # Flag the row by adding an extra column or modifying the existing column

                key = row[0]
                if key not in keframe_dict:
                    keframe_dict[key] = []
                keframe_dict[key].append({
                    "run": row[0],
                    "id": int(row[1]),
                    "o0": float(row[2]),
                    "o1": float(row[3]),
                    "o2": float(row[4]),
                    "o3": float(row[5]),
                    "o4": float(row[6]),
                    "o5": float(row[7]),
                    "o6": float(row[8]),
                    "o7": float(row[9]),
                    "o8": float(row[10]),
                    "o9": float(row[11]),
                    "o10": float(row[12]),
                    "o11": float(row[13]),
                    "o12": float(row[14]),
                    "o13": float(row[15]),
                    "o14": float(row[16]),
                    "o15": float(row[17]),
                    "o16": float(row[18]),
                    "o17": float(row[19]),
                    "o18": float(row[20]),
                    "o19": float(row[21]),
                    "o20": float(row[22]),
                    "o21": float(row[23]),
                    "o22": float(row[24]),
                    "a0": float(row[25]),
                    "a1": float(row[26]),
                    "a2": float(row[27]),
                    "a3": float(row[28]),
                    "a4": float(row[29]),
                    "a5": float(row[30]),
                    "a6": float(row[31]),
                    "r": float(row[31]),
                })

            prev_row = row  # Update the previous row

    with open('./vis/public/logs/keyframes_pusher.json', 'w') as f:
        json.dump(keframe_dict, f)

def add_mdp_series_into_embedding():
    print("Step 4: add_mdp_series_into_embedding")
    csv_file = './vis/public/logs/log_pusher.csv'
    embedding_file = './vis/public/logs/embedding_pusher.json'
    embedding_file_w_mdp = './vis/public/logs/embedding_pusher_mdp.json'

    df = pd.read_csv(csv_file)
    embedding_w_mdp_list = []

    # read from a JSON
    with open(embedding_file, 'r') as f:
        embedding_list = json.load(f)

        for embedding in tqdm(embedding_list):
            r = embedding["r"]
            filtered_df = df.query('r == @r')

            for i, row in filtered_df.iterrows():
                embedding["ob0_" + str(int(row["id"]))] = row["ob0"]
                embedding["ob1_" + str(int(row["id"]))] = row["ob1"]
                embedding["ob2_" + str(int(row["id"]))] = row["ob2"]
                embedding["ob3_" + str(int(row["id"]))] = row["ob3"]
                embedding["ob4_" + str(int(row["id"]))] = row["ob4"]
                embedding["ob5_" + str(int(row["id"]))] = row["ob5"]
                embedding["ob6_" + str(int(row["id"]))] = row["ob6"]
                embedding["ob7_" + str(int(row["id"]))] = row["ob7"]
                embedding["ob8_" + str(int(row["id"]))] = row["ob8"]
                embedding["ob9_" + str(int(row["id"]))] = row["ob9"]
                embedding["ob10_" + str(int(row["id"]))] = row["ob10"]
                embedding["ob11_" + str(int(row["id"]))] = row["ob11"]
                embedding["ob12_" + str(int(row["id"]))] = row["ob12"]
                embedding["ob13_" + str(int(row["id"]))] = row["ob13"]
                embedding["ob14_" + str(int(row["id"]))] = row["ob14"]
                embedding["ob15_" + str(int(row["id"]))] = row["ob15"]
                embedding["ob16_" + str(int(row["id"]))] = row["ob16"]
                embedding["ob17_" + str(int(row["id"]))] = row["ob17"]
                embedding["ob18_" + str(int(row["id"]))] = row["ob18"]
                embedding["ob19_" + str(int(row["id"]))] = row["ob19"]
                embedding["ob20_" + str(int(row["id"]))] = row["ob20"]
                embedding["ob21_" + str(int(row["id"]))] = row["ob21"]
                embedding["ob22_" + str(int(row["id"]))] = row["ob22"]
                embedding["a0_" + str(int(row["id"]))] = row["a0"]
                embedding["a1_" + str(int(row["id"]))] = row["a1"]
                embedding["a2_" + str(int(row["id"]))] = row["a2"]
                embedding["a3_" + str(int(row["id"]))] = row["a3"]
                embedding["a4_" + str(int(row["id"]))] = row["a4"]
                embedding["a5_" + str(int(row["id"]))] = row["a5"]
                embedding["a6_" + str(int(row["id"]))] = row["a6"]
                embedding["r_" + str(int(row["id"]))] = row["r"]

            embedding_w_mdp_list.append(embedding)

    with open(embedding_file_w_mdp, 'w') as f:
        json.dump(embedding_w_mdp_list, f)

if __name__ == '__main__':
    gen_trajectories() # generate trajectories for the pusher
    embedding() # embed the trajectories
    keyframes() # extract keyframes from the trajectories
    add_mdp_series_into_embedding() # add mdp series into the embedding