(function evoTSPwrapper($) {

    const baseUrl = 'https://ddu7p05etd.execute-api.us-east-1.amazonaws.com/prod'
    console.log(`The base URL is ${baseUrl}.`);

    // Set up the functions to be called when the user clicks on any
    // of the three buttons in our (very simple) user interface.
    // We provided `randomRoutes()` for you, but you have to implement
    // `getBestRoutes()` and `getRouteById()`.
    $(function onDocReady() {
        $('#generate-random-routes').click(randomRoutes);
        $('#get-best-routes').click(getBestRoutes);
        $('#get-route-by-id').click(getRouteById);
    });

    // This generates a single random route by POSTing the
    // runId and generation to the `/routes` endpoint.
    // It's asynchronous (like requests across the network
    // typically are), and the showRoute() function is called
    // when the request response comes in.
    function randomRoute(runId, generation) {
        $.ajax({
            method: 'POST',
            url: baseUrl + '/routes',
            data: JSON.stringify({
                runId: runId,
                generation: generation
            }),
            contentType: 'application/json', //type of data sent to the server
            // When a request completes, call `showRoute()` to display the
            // route on the web page.
            success: showRoute,
            error: function ajaxError(jqXHR, textStatus, errorThrown) {
                console.error(
                    'Error generating random route: ', 
                    textStatus, 
                    ', Details: ', 
                    errorThrown);
                console.error('Response: ', jqXHR.responseText);
                alert('An error occurred when creating a random route:\n' + jqXHR.responseText);
            }
        })
    }

    // Generates a collection of new routes, where the number to generate
    // (and the runId and generation) are specified in the HTML text
    // fields. Note that we don't do any kind of sanity checking here, when
    // it would make sense to at least ensure that `numToGenerate` is a
    // non-negative number.
    //
    // This uses the `async` library (https://caolan.github.io/async/v3/docs.html)
    // to place the requests asynchronously, so we can benefit from parallel
    // computation on the AWS end. You can get burned, though, if you set
    // numToGenerate too high as there are a host of AWS capacity limits that
    // you might exceed, leading to a failed HTTP requests. I've had no trouble
    // with up to 500 at a time, but 1,000 regularly breaks things.
    //
    // We never do anything with the `event` argument because we know what
    // button was clicked and don't care about anything else.
    function randomRoutes(event) {
        const runId = $('#runId-text-field').val(); //the value entered at this id in the html file
        const generation = $('#generation-text-field').val();
        const numToGenerate =$('#num-to-generate').val();
        // Reset the contents of `#new-route-list` so that it's ready for
        // `showRoute()` to "fill" it with the incoming new routes. 
        $('#new-route-list').text('');
        // 
        async.times(numToGenerate, () => randomRoute(runId, generation));
    }

    // When a request for a new route is completed, add an `<li>…</li>` element
    // to `#new-route-list` with that routes information.
    function showRoute(result) {
        console.log('New route received from API: ', result);
        const routeId = result.routeId;
        const length = result.length;
        $('#new-route-list').append(`<li>We generated route ${routeId} with length ${length}.</li>`);
    }

    // Make a `GET` request that gets the K best routes.
    // The form of the `GET` request is:
    //   …/best?runId=…&generation=…&numToReturn=…
    // This request will return an array of
    //    { length: …, routeId: …}
    // You should add each of these to `#best-route-list`
    // (after clearing it first).
    function getBestRoutes(event) {
        //
    }

    // Make a `GET` request that gets all the route information
    // for the given `routeId`.
    // The form of the `GET` request is:
    //   …/routes/:routeId
    // This request will return a complete route JSON object.
    // You should display the returned information in 
    // `#route-by-id-elements` (after clearing it first).
    function getRouteById(event) {
        const routeId = $('#route-ID').val(); //the input routeId
        $.ajax({
            method: 'GET',
            url: baseUrl + '/routes/' + routeId,
            contentType: 'application/json', //type of info sent to the database
            data: JSON.stringify({
                routeId: routeId,
            }),

            success: showEntireRoute,
            error: function ajaxError(jqXHR, textStatus, errorThrown) {
                console.error(
                    'Error getting route details by Id: ', 
                    textStatus, 
                    ', Details: ', 
                    errorThrown);
                console.error('Response: ', jqXHR.responseText);
                alert('An error occurred when getting route details:\n' + jqXHR.responseText);
            }
        })
        $('#route-by-id-elements').text(''); //clearing info to make room for new ones
    }

    function showEntireRoute(result){
        console.log('Route details from the database: ', result);
        const routeId = result.routeId;
        const length = result.length;
        const route = result.route;
        const partitionKey = result.partitionKey;
        
        //$('#new-route-list').append(`<li>We generated route ${routeId} with length ${length}.</li>`);
        $('#route-by-id-elements').append(`<li>Route Id: ${routeId}</li>`);
    }

}(jQuery));
