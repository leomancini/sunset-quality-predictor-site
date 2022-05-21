<?php
	function renderCalendar($predictions) {	
		$period = new DatePeriod(
			new DateTime('2022-05-03'),
			new DateInterval('P1D'),
			new DateTime('2022-05-31')
		);

		$dates = [];
		foreach ($period as $date) {
			$dates[] = $date;
		}

		foreach ($dates as $key => $date) {
			if ($key === 0) {
				echo "<div class='monthName'>".$date->format('F')."</div>";
				echo "<div class='month'>";
				$firstWeekOfMonth = false;
			} else if (($dates[$key - 1]->format('m') !== $date->format('m'))) {
				echo "</div>";
				echo "<div class='monthName'>".$date->format('F')."</div>";
				echo "<div class='month'>";
				$firstWeekOfMonth = false;
			}

			if (!$firstWeekOfMonth) {
				$x = 1;

				while($x <= intval($date->format('N'))) {
					echo "<div class='day hidden'></div>";
					$x++;
					$firstWeekOfMonth = true;
				}
			}
			
			if ($predictions[$date->format('Y-m-d')]['rating']) {
				$rating = intval($predictions[$date->format('Y-m-d')]['rating']);
				$confidence = intval($predictions[$date->format('Y-m-d')]['confidence']);

				echo "<div class='day filled day-".$date->format('N')."' data-date='".$date->format('Y-m-d')."' data-date-formatted='".$date->format('l M j, Y')."' data-rating='".$rating."' data-confidence='".$confidence."' style='background-image: url(\"resources/images/thumbnails/thumbnail-".$rating.".jpg\")'>";

				echo "<div class='stars'>";

				echo "<div class='star ".(($rating >= 1) ? 'filled' : 'unfilled')."'></div>";
				echo "<div class='star ".(($rating >= 2) ? 'filled' : 'unfilled')."'></div>";
				echo "<div class='star ".(($rating >= 3) ? 'filled' : 'unfilled')."'></div>";
				echo "<div class='star ".(($rating >= 4) ? 'filled' : 'unfilled')."'></div>";
				echo "<div class='star ".(($rating === 5) ? 'filled' : 'unfilled')."'></div>";

				echo '</div>';

				echo '<div class="expand"></div>';

				echo '<div class="videoContainer"><video playsinline autoplay muted loop></video><div class="loading"></div><div class="error"></div></div>';
			} else {
				echo "<div class='day empty'>";
			}

			echo '<label>'.$date->format('j').'</label>';

			echo '</div>';
		}

		echo "</div>";
	}
?>