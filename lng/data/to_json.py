#!/usr/bin/env python
import pandas as pd
import json
import sys
import io

file_name = ''
if len(sys.argv) != 2:
  print("USAGE: ./to_json.py <frequency response file name>.txt")
  exit(-1)
else:
 file_name = sys.argv[1]
 if not file_name.endswith("txt"):
   print("Error: Please give a file ends with .txt suffix")
   exit(-1)

line_list = ["Freq(Hz) SPL(dB) Phase(degrees)"]
with open(file_name, "r") as f:
  for line in iter(f.readline, ""):
    stripped_line = (line.strip() or "")
    if stripped_line.startswith("*") or stripped_line.startswith("Freq"):
      continue
    if stripped_line:
      line_list.append(stripped_line)

buf = io.StringIO("\n".join(line_list))
dt = pd.read_csv(buf, sep=' ')
# BBB: better to use DataFrame.to_dict(). Then json.dump() the dict
fr_json = dt[['Freq(Hz)','SPL(dB)']].T.to_json(orient='values')
d = json.loads(fr_json)
with open(file_name.replace("txt", "json"), 'w') as f:
  # indent=1 is more readable for human and text editor, but the data size is 30% bigger
   json.dump(d, f, indent=1)
  #json.dump(d, f)

# Test
# $ node
# > var json = JSON.parse(fs.readFileSync('./hifiman_re800_silver_r_single_flange_fr.json', 'utf8'));
# a Usage in bash:
# $ for f in *fr.txt; do ./to_json.py $f ;done
