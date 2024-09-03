from datetime import datetime
with open(f'change_log.csv', 'a') as f:
    f.write('\n'+datetime.now().strftime("%Y-%m-%d_%H:%M:%S"))
