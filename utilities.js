const axios = require("axios");

module.exports = {
  getProjects: async () => {
    try {
      let all_projects = await getProjects();
      return all_projects.map((x) => new Object({ name: x.name, key: x.key }));
    } catch (e) {
      return e;
    }
  },
  getReport: async (project_name, sprint_number) => {
    let board = await axios(
      `/rest/agile/1.0/board?projectKeyOrId=${project_name}`
    ).then((response) => response.data);

    let board_id = await board.values[0].id;
    // console.log(board_id);

    let sprints = await getSprints(board_id);
    // talvez só oferecer uma lista de opções com todas as sprints já funcione
    let last_closed = sprints.filter((x) => x.state == "closed").slice(-1)[0];
    let sprint_id = last_closed.id;
    // console.log(last_closed);

    let report = await axios(
      `/rest/greenhopper/1.0/rapid/charts/sprintreport?rapidViewId=${board_id}&sprintId=${sprint_id}`
    ).then((response) => response.data);

    let completedIssues = await getCompletedIssues(report);

    // console.log(completedIssues);
    let report_result = {
      sprint: {
        name: report.sprint.name,
        goal: report.sprint.goal,
        startDate: report.sprint.isoStartDate,
        endDate: report.sprint.isoEndDate,
        completedDate: report.sprint.isoCompleteDate,
        parsedDates: {
          startDate: new Date(report.sprint.isoStartDate)
            .toLocaleString("pt-BR", {
              year: "numeric",
              month: "short",
              day: "numeric",
            })
            .replace(/ de /g, "/")
            .replace(/ |\./g, ""),
          endDate: new Date(report.sprint.isoEndDate)
            .toLocaleString("pt-BR", {
              year: "numeric",
              month: "short",
              day: "numeric",
            })
            .replace(/ de /g, "/")
            .replace(/ |\./g, ""),
          completedDate: new Date(report.sprint.isoCompleteDate)
            .toLocaleString("pt-BR", {
              year: "numeric",
              month: "short",
              day: "numeric",
            })
            .replace(/ de /g, "/")
            .replace(/ |\./g, ""),
        },
      },
      completed_issues: completedIssues,
    };
    report_result.sprint.parsedDates.period = `${report_result.sprint.parsedDates.startDate} - ${report_result.sprint.parsedDates.endDate}`;

    return report_result;
  },
};

function getSprints(board_id) {
  let data = [];

  let fetchData = (startAt) => {
    return axios(`/rest/agile/1.0/board/${board_id}/sprint?startAt=${startAt}`)
      .then((response) => response)
      .then((response) => response.data)
      .then((sprints) => {
        // console.log(sprints);

        data = [...data, ...sprints.values];

        if (sprints.isLast) {
          return data;
        } else {
          let nextPage = startAt + sprints.values.length;
          return fetchData(nextPage);
        }
      });
  };

  return fetchData(0);
}

function getProjects() {
  let data = [];

  let fetchData = (startAt) => {
    return axios(
      `/rest/api/3/project/search?orderBy=issueCount&startAt=${startAt}`
    )
      .then((response) => response)
      .then((response) => response.data)
      .then((projects) => {
        // console.log(sprints);

        data = [...data, ...projects.values];

        if (projects.isLast) {
          return data;
        } else {
          let nextPage = startAt + projects.values.length;
          return fetchData(nextPage);
        }
      });
  };

  return fetchData(0);
}

async function getCompletedIssues(report) {
  let completedIssues = report.contents.completedIssues.map((x) => {
    return {
      key: x.key,
      summary: x.summary,
      url: `${process.env.API_BASE_URL}/browse/${x.key}`,
    };
  });

  let promiseArray = [];

  completedIssues.forEach(async (issue) => promiseArray.push(findDod(issue)));

  let completed = await Promise.all(promiseArray);

  return completed;
}

async function findDod(issue_obj) {
  let issue_details = await axios(
    `/rest/api/3/issue/${issue_obj.key}?fields=description&expand=renderedFields`
  ).then((x) => x.data);

  //let dod = issue_details.renderedFields.description.replace(/<.*?>/g,'').replace(/(\r\n|\n|\r)/gm,' ')

  let parsed_desc = issue_details.fields?.description?.content
    ?.filter((x) => x.type == "paragraph")
    ?.flatMap((x) => x.content.map((x) => x.text))
    ?.join(" ");

  issue_obj.description = parsed_desc;
  return issue_obj;
}
