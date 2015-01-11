#!/bin/sh
pbpaste > decodein
node decodemap.js
/Applications/MATLAB_R2014b.app/Contents/MacOS/MATLAB_maci64 -nodesktop -nosplash -r "M = csvread('decodeout'); mn=min(M(:)); mx=max(M(:)); disp (mn); disp (mx); imshow(M, [mn,mx]);"



