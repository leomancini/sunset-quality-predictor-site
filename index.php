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
		<link href="https://fonts.googleapis.com/css2?family=Inter:wght@500;600;700&display=swap" rel="stylesheet">
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
				<p>
				TESTINGLorem ipsum dolor sit amet, consectetur adipiscing elit. Aliquam mollis at turpis quis congue. Sed sollicitudin odio ut arcu feugiat, vitae eleifend orci mattis. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla facilisi. In at condimentum felis, quis suscipit massa. Aenean fermentum eros at pharetra porttitor. In eget convallis dui. Vivamus sit amet nibh at nisi consectetur maximus sit amet eu tellus. Mauris imperdiet nulla in vulputate pretium. Sed congue magna in erat placerat lobortis. Nunc sed magna ante. Nunc iaculis mattis lacus, non tincidunt sem ornare ac.
				</p>
				<p>
				Sed dignissim fringilla nulla, vitae efficitur tortor sollicitudin quis. Praesent mollis, turpis at aliquet dapibus, metus quam dictum tellus, vitae tristique sapien neque tristique dolor. Aliquam erat volutpat. Pellentesque ut consequat ligula. Duis vel ornare justo, at imperdiet felis. Mauris sed elit nec dolor euismod faucibus ac vel leo. Duis ultrices nec eros iaculis iaculis. Duis congue laoreet augue vitae accumsan. Mauris ut eros interdum, accumsan arcu ut, pulvinar quam. Vivamus eleifend elementum mi vel rhoncus. Mauris at diam dui.
				</p>
				<p>
				Duis scelerisque orci ut lorem varius, non consectetur mi convallis. Nam in urna ante. Morbi a nisl a nisi placerat molestie at vel velit. Donec ut nibh mauris. Mauris facilisis odio sed ligula facilisis rhoncus. Nulla in risus arcu. Donec efficitur accumsan odio eu iaculis. Nam laoreet, leo sit amet mollis luctus, augue ante convallis urna, ac dignissim augue erat semper mauris. Suspendisse in vestibulum nisl, vitae laoreet urna. Sed sed magna tincidunt, vulputate leo elementum, ullamcorper diam. Ut ultrices vitae ante at scelerisque. Nullam dapibus enim nec imperdiet suscipit. In vel luctus est. Vestibulum ligula lorem, ultricies nec luctus eu, tincidunt ut eros. Nam sit amet libero eu orci placerat congue ac vitae arcu.
				</p>
				<p>
				Curabitur id condimentum odio. Phasellus mattis metus et tristique facilisis. Aenean cursus posuere justo in accumsan. Morbi imperdiet in lacus at eleifend. In in rutrum mi. Aliquam gravida nisl non lorem ultrices, sed egestas purus posuere. Etiam convallis, augue vel aliquet convallis, odio tellus pulvinar nisl, at tempor libero augue sed metus. Nunc placerat tortor et bibendum tempor. Fusce luctus, nunc sed pharetra semper, nisl turpis convallis eros, non venenatis diam augue sit amet velit. Aenean mollis, dolor quis consectetur congue, quam urna lobortis massa, et vulputate ligula risus eget lacus. Cras sit amet lacinia urna. Sed nunc purus, tempus ut sodales at, euismod commodo nisl. Aenean dui mauris, volutpat a justo at, scelerisque dignissim quam. Suspendisse a pulvinar elit, ut porta nisi.
				</p>
			</section>
		</div>
		<script src='resources/js/main.js'></script>
	</body>
</html>