for i in 610 620;
do
    for j in $(seq 1 13);
    do
	m=$(echo $j | awk '{printf("%02d", $1)}')
	for el in "recap" "intro" "interact" "assessment" "nextup";
	do
	    cont="<html>CCCS"$i" Module "$j" placeholder content for "$el"</p></html>"
	    touch CCCS${i}/M${m}/${el}.html
	    echo $cont > CCCS${i}/M${m}/${el}.html
	done
	js='console.log("dummy script loaded");'
	touch CCCS${i}/M${m}/code.js
	echo $js > CCCS${i}/M${m}/code.js
    done	  
done	  
	    
