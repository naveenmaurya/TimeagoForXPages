function getISO8601String(d) {
	var convertDate:java.util.Date;
	if (d instanceof lotus.domino.DateTime) {
		convertDate = d.toJavaDate();
	} else {
		convertDate = d;
	}
	var tz:java.util.TimeZone = java.util.TimeZone.getTimeZone("UTC");
	var sdf:java.text.SimpleDateFormat = new java.text.SimpleDateFormat("yyyy-MM-dd'T'HH:mm'Z'");
	sdf.setTimeZone(tz);
	return sdf.format(convertDate);
}