#!/usr/bin/env bash

CHANGED_UNIT_TESTS_ONLY=True
CHANGED_DOCS_ONLY=True
CHANGED_UNIT_TESTS_AND_DOCS_ONLY = True

DIFFS=$(git diff origin/master --name-only)

for DIFF in ${DIFFS}
do
	if ! echo "${DIFF}" | grep 'packages/.*/tests/.*'
	then
		CHANGED_UNIT_TESTS_ONLY=False
		break
	fi
	if ! echo "${DIFF}" | grep 'docs/.*'
	then
		CHANGED_DOCS_ONLY=False
		break
	fi
	if [ $CHANGED_UNIT_TESTS_ONLY == "False" && $CHANGED_DOCS_ONLY == "False" ]
	then
	 if ! echo "${DIFF}" | grep grep -E '(docs/.*|packages/.*/tests/.*)'
	 then
		 CHANGED_UNIT_TESTS_AND_DOCS_ONLY=False
		 break
	 fi
	fi
done

if [ ! "${DIFF}" ]
then
	echo "no files are changed"
elif [ $CHANGED_UNIT_TESTS_ONLY == "True" ]
then
	echo "only unit tests files are changed"
	touch runUnitTestsOnly
elif [ $CHANGED_DOCS_ONLY == "True" ]
then
	echo "only docs files are changed"
	touch runTestsForDocsChangeOnly
elif [ $CHANGED_UNIT_TESTS_AND_DOCS_ONLY == "True" ]
then
	echo "only unit tests files and docs files are changed"
	touch runUnitTestsOnly
else
	echo "files other than unit tests files and docs files are also changed"
fi
