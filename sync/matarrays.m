subplot = @(m,n,p) subtightplot (m, n, p, [0.04 0.02], [0.1 0.1], [0.01 0.05]);

while 1
	clf
	disp ('Updating...');

	context = importdata('context');


	files = [];
	for i=[0:size(context,1)]
		filename = strcat('arrays', int2str(i));
		if exist(filename, 'file') == 2
			files = [files;filename];
		end
	end
	% disp(files);

	%divs = ceil(size(context,1))
	%width = divs(ceil(length(divs)/2))
	%height = size(context,1)/width
	height = floor(sqrt(size(context,1)+1));
	width = ceil ((size(context,1)+1)/height);

	if width < height
		tmp = width;
		width = height;
		height = tmp;
	end

	for i=[1:size(context,1)]
		filename = files(i,:);
		fileContext = context(i,:);
		M = importdata(filename);

		if (ismatrix(M) && floor(sqrt(length(M)))^2 == length(M))
			mn=min(M(:));
			mx=max(M(:));
			mx = max(mx,mn+1);
			%disp (mn);
			%disp (mx);

			M = reshape(M, sqrt(length(M)), sqrt(length(M)));
			M = fliplr(rot90 (M, 3));
			p = subplot (height,width, i);
			
			%subimage(M, [mn,mx]);
			imshow(M, [mn,mx]);
			%colormap(p, jet)
			colormap (p, hot)
			axis off
			title (fileContext);
		end
	end

	hp4 = get(subplot(height,width,width*height),'Position')
	colormap (hot)
	colorbar('Position', [hp4(1)+hp4(3)+0.01  hp4(2)  0.1  hp4(2)+hp4(3)*2.8])
	axis off
	grid off

	disp ('Done')
	pause (2)
end