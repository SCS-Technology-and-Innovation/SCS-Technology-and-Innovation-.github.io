term=W24
c=660
mkdir -p Import
mkdir -p Import/${term}
mkdir -p Import/${term}/CCCS${c}
cp gtest.html Import/${term}/CCCS${c}/Glossary.html # attach the glossary outside as a separate entity
elements=("Recap" "Introduction" "Interaction" "Assessment" "Preview")
eltags=("recap" "intro" "interact" "assessment" "nextup")
closing="<script src='https://scs-technology-and-innovation.github.io/populate.js'></script></body></html>"
for j in $(seq 1 13); # all the modules
do
    m=$(echo $j | awk '{printf("%02d", $1)}')
    mkdir -p Import/${term}/CCCS${c}/Module${m}
    for i in ${!elements[@]};
    do
	el=${elements[$i]};
	et=${eltags[$i]};
	echo $el $et
	cont="<html><h1>CCCS "$c" &mdash; Term "${term}"</h1><h2>Module "$j"</h2><h3>"$el"</h3><div id='content'></div><script>var term='"$term"'var course = '"$c"';var module = '"$m"';var element = '"$et"';</script>"$closing
	touch Import/${term}/CCCS${c}/Module${m}/${el}.html
	echo $cont > Import/${term}/CCCS${c}/Module${m}/${el}.html
    done
done	  
