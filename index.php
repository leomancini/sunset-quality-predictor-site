<?php
	require ('renderCalendar.php');

	function getSunsetPredictions() {
		$curl = curl_init();
		curl_setopt($curl, CURLOPT_RETURNTRANSFER, true);
		curl_setopt($curl, CURLOPT_URL, 'https://nycsunsetbot.leo.gd/api/history.php');
		$result = curl_exec($curl);
		$data = json_decode($result, true);
		curl_close($ch);

		return $data;
	}

	date_default_timezone_set('America/New_York');
	$today = date('Y-m-d', time());
	$yesterday = date('Y-m-d', strtotime('-1 day'));

	$predictions = getSunsetPredictions();
	
	$firstDateWithPrediction = array_key_first($predictions);

	$date = strtotime($firstDateWithPrediction);
	$rating = intval($predictions[$firstDateWithPrediction]['rating']);
	$confidence = intval($predictions[$firstDateWithPrediction]['confidence']);
	
	if ($firstDateWithPrediction === $today) {
		$predictionDay = 'today\'s';
	} else if ($firstDateWithPrediction === $yesterday) {
		$predictionDay = 'yesterday\'s';
	} else {
		$predictionDay = 'latest';
	}
?>
<!DOCTYPE HTML>
<html>
	<head>
		<title>Sunset Prediction</title>
		<link rel='stylesheet/less' href='resources/css/style.less'>
		<script src='//cdnjs.cloudflare.com/ajax/libs/less.js/3.11.1/less.min.js'></script>
		<meta name='viewport' content='width=device-width, initial-scale=1'>
		<link rel="preconnect" href="https://fonts.googleapis.com">
		<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
		<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
	</head>
	<body>
		<div id='navigation'>
			<div class='item selected' data-section-id='latest-prediction'>Latest</div>
			<div class='item' data-section-id='history'>History</div>
			<div class='item' data-section-id='about'>About</div>
			<div class='item' data-section-id='follow'>Follow</div>
		</div>
		<section data-section-id='latest-prediction'>
			<div id='content'>
				<div id='logo'></div>
				<div id='title'><?php echo $predictionDay; ?> Sunset Prediction</div>
				<div id='date'><div class='day'><?php echo date('l', $date); ?></div> <div class='date'><?php echo date('M j', $date); ?></div></div>
				<div id='stars'>
					<div class='star <?php echo ($rating >= 1) ? 'filled' : 'unfilled'; ?>'></div>
					<div class='star <?php echo ($rating >= 2) ? 'filled' : 'unfilled'; ?>'></div>
					<div class='star <?php echo ($rating >= 3) ? 'filled' : 'unfilled'; ?>'></div>
					<div class='star <?php echo ($rating >= 4) ? 'filled' : 'unfilled'; ?>'></div>
					<div class='star <?php echo ($rating === 5) ? 'filled' : 'unfilled'; ?>'></div>
				</div>
				<div id='confidence'><?php echo $confidence; ?>% Confident</div>
			</div>
			<div id='background'>
				<div id='gradient' style='background-image: url("resources/images/backgrounds/background-<?php echo $rating; ?>.jpg")'></div>
			</div>
		</section>
		<div id='sections'>
			<section data-section-id='history'>
				<div id='calendar'>
					<?php renderCalendar($predictions); ?>
				</div>
			</section>
			<section data-section-id='about'>
				<div class='about-section paragraph-left'>
					<div class='text'>
						<h3>Collecting images</h3>
						<p>
						A camera is positioned so that it's pointing west at the New York City skyline. Snapshots are taken every minute and saved to a hard drive. The images are compiled into composite images of every 15 minutes from midnight to one hour before sunset.
						</p>
					</div>
					<img src='resources/images/about/sample-composite-image.png'>
				</div>
				<div class='about-section paragraph-right'>
					<img src='https://www.leomancini.net/projects/sunset-quality-training-data-builder/screenshots/animated@2x.png' style='width: 55%; margin-left: -3%; margin-right: -8%;'>
					<div class='text' style='margin-left: 13%;'>
						<h3>Building a training data set</h3>
						<p>
						Friends and family are invited to rate sunsets from one to five stars. They can view an animated loop or grid of snapshots every minute for 30 minutes before and 60 minutes after sunset. These ratings are saved in an Airtable database.
						</p>
					</div>
				</div>
				<div class='about-section paragraph-left'>
					<div class='text'>
						<h3>Training the model</h3>
						<p>
						The collected ratings are matched to the composite images of every 15 minutes from midnight to one hour before sunset. This forms the training data set for a TensorFlow model that is re-trained on top of a MobileNet base model.
						</p>
					</div>
					<img src='resources/images/about/sample-composite-image.png'>
				</div>
				<div class='about-section paragraph-right'>
					<img src='resources/images/about/sample-composite-image.png'>
					<div class='text'>
						<h3>Making predictions</h3>
						<p>
						Once the model is trained, it is run every day one hour before sunset. Once it has made a prediction, it generates an image with the date, star rating, and confidence level and posts it to the @nycsunsetbot Instagram page.
						</p>
					</div>
				</div>
			</section>
		</div>
		<script src='resources/js/main.js'></script>
	</body>
</html>