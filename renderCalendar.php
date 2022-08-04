<?php
	function renderCalendar($predictions) {	
		$startDate = '2022-05-01';

		$period = new DatePeriod(
			new DateTime($startDate),
			new DateInterval('P1D'),
			new DateTime('last day of this month')
		);

		$monthKey = 0;

		$months = [];
		$dates = [];
		
		foreach ($period as $date) {
			$months[] = $date->format('m');
			$dates[] = $date;
		}

		$months = array_unique($months);

		foreach ($dates as $key => $date) {
			if ($dates[$key - 1] && ($dates[$key - 1]->format('m') !== $date->format('m'))) {
				echo "</div>";
			}

			if ($key === 0 || ($dates[$key - 1] && $dates[$key - 1]->format('m') !== $date->format('m'))) {
				echo "<div class='month".($monthKey === (count($months) - 1) ? ' visible' : '')."' id='month-".$monthKey."'>";
				echo "<div class='monthHeader'>";
				echo "<div class='monthNavigationWrapper'>";
				echo '<div class="monthNavigation'.((count($months) > 1) ? ' visible' : '').'" data-direction="back">'.date('F', strtotime($dates[$key]->format('Y-m').' -1 month')).'</div>';
				echo '</div>';
				echo "<div class='monthName'>".$date->format('F')."</div>";
				echo "<div class='monthNavigationWrapper'>";
				echo '<div class="monthNavigation" data-direction="forward">'.date('F', strtotime($dates[$key]->format('Y-m').' +1 month')).'</div>';
				echo '</div>';
				echo '</div>';
				echo "<div class='dayNames'>";
				echo '<div class="dayName">Sun</div>';
				echo '<div class="dayName">Mon</div>';
				echo '<div class="dayName">Tue</div>';
				echo '<div class="dayName">Wed</div>';
				echo '<div class="dayName">Thu</div>';
				echo '<div class="dayName">Fri</div>';
				echo '<div class="dayName">Sat</div>';
				echo '</div>';

				$monthKey++;
				$firstWeekOfMonth = false;
			}

			if (!$firstWeekOfMonth) {
				$weekDaysBeforeMonthStarts = 1;

				// Get number of weekdays before month starts
				while($weekDaysBeforeMonthStarts <= intval($date->format('N'))) {
					$weekDaysBeforeMonthStarts++;
					$firstWeekOfMonth = true;
				}

				// Only show hidden days if there are less than 7
				if ($weekDaysBeforeMonthStarts <= 7) {
					$hiddenDays = 1;

					while($hiddenDays <= intval($date->format('N'))) {
						$hiddenDays++;
						echo "<div class='day hidden'></div>";
					}
				}
			}
			
			if ($predictions[$date->format('Y-m-d')]['rating']) {
				$rating = intval($predictions[$date->format('Y-m-d')]['rating']);
				$confidence = intval($predictions[$date->format('Y-m-d')]['confidence']);

				echo "<div class='day filled day-".$date->format('N')."' data-date='".$date->format('Y-m-d')."' data-date-formatted='".$date->format('l F j, Y')."' data-rating='".$rating."' data-confidence='".$confidence."' style='background-image: url(\"resources/images/thumbnails/thumbnail-".$rating.".jpg\")'>";

				echo "<div class='stars'>";

				echo "<div class='star ".(($rating >= 1) ? 'filled' : 'unfilled')."'></div>";
				echo "<div class='star ".(($rating >= 2) ? 'filled' : 'unfilled')."'></div>";
				echo "<div class='star ".(($rating >= 3) ? 'filled' : 'unfilled')."'></div>";
				echo "<div class='star ".(($rating >= 4) ? 'filled' : 'unfilled')."'></div>";
				echo "<div class='star ".(($rating === 5) ? 'filled' : 'unfilled')."'></div>";

				echo '</div>';

				echo '<div class="expand"></div>';

				echo '<div class="videoContainer"><video playsinline autoplay muted loop></video><div class="loading hidden"></div><div class="error"></div></div>';
			} else {
				echo "<div class='day empty'>";
			}

			echo '<label>'.$date->format('j').'</label>';

			echo '</div>';
		}

		echo '<div id="dayWithoutVideoTooltip">Sunset video not ready</div>';

		echo "</div>";
	}
?>