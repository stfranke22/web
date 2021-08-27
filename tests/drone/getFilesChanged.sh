#!/usr/bin/env bash

CHANGED_UNIT_TESTS_ONLY=True
CHANGED_DOCS_ONLY=True
CHANGED_UNIT_TESTS_AND_DOCS_ONLY=True

DIFFS=$(git diff origin/master --name-only)
echo "---------------------------------------"
echo $DIFFS
echo "---------------------------------------"
DOCS_ONLY_CHANGES=$(echo "$DIFFS" | grep -E '(docs/.*|changelog/.*)')
echo "+++++++++++++++++"
echo $DOCS_ONLY_CHANGES
echo "+++++++++++++++++"
UNIT_TESTS_CHANGES=$(echo "$DIFFS" | grep 'packages/.*/tests/.*')
echo "***************************"
echo $UNIT_TESTS_CHANGES
echo "***************************"
DOCS_AND_UNIT_TESTS_ONLY_CHANGES=$(echo "$DIFFS" | grep -E '(docs/.*|changelog/.*|packages/.*/tests/.*)')
echo "#################"
echo $DOCS_AND_UNIT_TESTS_ONLY_CHANGES
echo "#################"


echo "                                                   "
echo "                                                   "
echo "                                                   "
changesExceptDocsChanges=$(echo ${DIFFS[@]} ${DOCS_ONLY_CHANGES[@]} | tr ' ' '\n' | sort | uniq -u)
echo $changesExceptDocsChanges
echo "==========================="
echo "                                                   "
echo "                                                   "
changesExceptUnitTestsChanges=$(echo ${DIFFS[@]} ${UNIT_TESTS_CHANGES[@]} | tr ' ' '\n' | sort | uniq -u)
echo $changesExceptUnitTestsChanges
echo "^^^^^^^^^^^^^^^^^^^^^^^^^^^"
echo "                                                   "
echo "                                                   "
changesExceptUnitTestsAndDocsChanges=$(echo ${DIFFS[@]} ${DOCS_AND_UNIT_TESTS_ONLY_CHANGES[@]} | tr ' ' '\n' | sort | uniq -u)
echo $changesExceptUnitTestsAndDocsChanges
echo "%%%%%%%%%%%%%%%%%%%%%%%%"
echo "                                                   "
echo "                                                   "

if ((${#DIFFS})); then
 if ((${#changesExceptUnitTestsAndDocsChanges})); then
   echo "1111111111111111111111111111111111111"
#   echo "FILES OTHER THAN UNIT TESTS AND DOCS ARE ALSO CHANGED"
#   CHANGED_UNIT_TESTS_AND_DOCS_ONLY=False
#   CHANGED_UNIT_TESTS_ONLY=False
#   CHANGED_DOCS_ONLY=False
 else
   if ((${#changesExceptDocsChanges})); then
     echo "2222222222222222222222222222222222222"
#      echo "FILES OTHER THAN DOCS FILES ARE ALSO CHANGED"
#      CHANGED_DOCS_ONLY=False
   elif ((${#changesExceptUnitTestsChanges})); then
     echo "333333333333333333333333333333333333333"
#      echo "FILES OTHER THAN UNIT TEST FILES ARE ALSO CHANGED"
#      CHANGED_UNIT_TESTS_ONLY=False
    fi
  fi

 if [ $CHANGED_UNIT_TESTS_ONLY == "True" ]
  then
    echo "44444444444444444444444444444444444444"
#  	echo "ONLY UNIT TEST FILES ARE CHANGED"
#  	touch runUnitTestsOnly
  elif [ $CHANGED_DOCS_ONLY == "True" ]
  then
    echo "555555555555555555555555555555555"
#  	echo "ONLY DOCS FILES ARE CHANGED"
#  	touch runTestsForDocsChangeOnly
  elif [ $CHANGED_UNIT_TESTS_AND_DOCS_ONLY == "True" ]
  then
    echo "6666666666666666666666666666666666666666"
#  	echo "ONLY UNIT TEST FILES ARE DOCS FILES ARE CHANGED"
#  	touch runUnitTestsOnly
  fi
else
  echo "NO FILES ARE CHANGED"
fi
