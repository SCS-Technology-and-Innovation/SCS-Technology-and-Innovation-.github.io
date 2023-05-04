for i in 1 2;
do
    for j in $(seq 1 13);
    do
	m=$(echo $j | awk '{printf("%02d", $1)}')
	for el in "recap" "intro" "interact" "assessment" "nextup";
	do
	    cont="<html><h1>CCCS6"$i"0</h1><h2>Module "$j"</h2><h3>Placeholder content for "$el"</h3><p>This is a test for James.</p></html>"
	    touch CCCS6${i}0/M${m}/${el}.html
	    echo $cont > CCCS6${i}0/M${m}/${el}.html
	    done
    done	  
done	  
	    
