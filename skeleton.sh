c=610
mkdir -p Import
mkdir Import/CCCS${c}
cp gtest.html Import/CCCS${c}/Glossary.html # attach the glossary outside as a separate entity
elements=("Recap" "Introduction" "Interaction" "Assessment" "Preview")
eltags=("recap" "intro" "interact" "assessment" "nextup")
closing="<script src='https://scs-technology-and-innovation.github.io/populate.js'></script></body></html>"
for j in $(seq 1 13); # all the modules
do
    m=$(echo $j | awk '{printf("%02d", $1)}')
    mkdir -p Import/CCCS${c}/Module${m}
    for i in ${!elements[@]};
    do
	el=${elements[$i]};
	et=${eltags[$i]};
	echo $el $et
	cont="<html><h1>CCCS "$c"</h1><h2>Module "$j"</h2><h3>"$el"</h3><div id='content'></div><script>var course = '"$"';var module = '"$m"';var element = '"$et"';</script>"$closing
	touch Import/CCCS${c}/Module${m}/${el}.html
	echo $cont > Import/CCCS${c}/Module${m}/${el}.html
    done
done	  
