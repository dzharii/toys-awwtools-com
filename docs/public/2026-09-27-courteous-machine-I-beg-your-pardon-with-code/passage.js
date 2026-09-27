/* The Courteous Machine - passages.
 *
 * Most of this phrasebook is a sentence or two. A passage is the larger form:
 * a complete message in several paragraphs, where the opening sets the tone,
 * the middle states the particulars, and the close names the next step.
 *
 * Passages arrive with three marks of their own, and losing any of them would
 * flatten the message into something less useful than it was written to be:
 *
 *   **Download export**   a control the reader is being asked to select
 *   `orders-june.csv`     a literal value: a filename, an identifier, a code
 *   `<expires_at>`        a blank the sending program is expected to fill
 *
 * So a passage is stored exactly as it was written, and this file is the one
 * place that knows how to read it. Everything else - the card, the code
 * generator, the search index - asks here rather than keeping its own opinion.
 *
 * Classic script. No modules, no network requests, no dependencies.
 */
(function () {
  'use strict';

  var PLACEHOLDER = /^<[a-zA-Z][\w. -]*>$/;
  var INLINE = /(\*\*[\s\S]+?\*\*|`[^`]+`)/;

  /* Paragraphs are separated by a blank line, exactly as written. */
  function paragraphs(passage) {
    return String(passage).replace(/\r\n?/g, '\n').split('\n\n');
  }

  /* One paragraph becomes a flat list of runs. A run carries its text and the
   * marks that apply to it: s for a control label, c for a literal value,
   * p for a blank awaiting a value. Marks nest in practice - a control label
   * may quote a blank, as in "Open in `<application_name>`" - so they are
   * recorded as flags on one run rather than as a tree. */
  function runs(paragraph) {
    var out = [];

    function push(text, strong) {
      if (!text) return;
      var parts = text.split(/(`[^`]+`)/);
      for (var i = 0; i < parts.length; i += 1) {
        var part = parts[i];
        if (!part) continue;
        if (part.charAt(0) === '`' && part.length > 1) {
          var value = part.slice(1, -1);
          out.push({ v: value, s: strong, c: true, p: PLACEHOLDER.test(value) });
        } else {
          out.push({ v: part, s: strong, c: false, p: false });
        }
      }
    }

    String(paragraph).split(INLINE).forEach(function (piece) {
      if (!piece) return;
      if (piece.slice(0, 2) === '**' && piece.slice(-2) === '**' && piece.length > 4) {
        push(piece.slice(2, -2), true);
      } else {
        push(piece, false);
      }
    });
    return out;
  }

  /* The message as a program would actually send it: the marks are instructions
   * to this page, not characters the reader should ever receive. Blanks keep
   * their angle brackets, because that is how the rest of this project writes a
   * value that has still to be supplied. */
  function plain(passage) {
    return paragraphs(passage).map(function (paragraph) {
      return runs(paragraph).map(function (run) { return run.v; }).join('');
    }).join('\n\n');
  }

  /* The blanks a passage expects, in the order they first appear. */
  function blanks(passage) {
    var seen = {};
    var found = [];
    paragraphs(passage).forEach(function (paragraph) {
      runs(paragraph).forEach(function (run) {
        if (!run.p) return;
        var name = run.v.slice(1, -1);
        if (Object.prototype.hasOwnProperty.call(seen, name)) return;
        seen[name] = true;
        found.push(name);
      });
    });
    return found;
  }

  /* Sample values for every blank the passages use. They share one imagined
   * afternoon - Sunday 27 September 2026 - so that a reader moving between
   * entries is not asked to believe in several different presents at once.
   * Names and addresses are invented, and example.org is reserved for exactly
   * this purpose. These are illustrations, not recommendations about what any
   * particular system should say. */
  var SAMPLES = {
    account_name: 'Ashworth Studio',
    application_name: 'Ledger',
    approval_expires_at: '3 October 2026, 17:00 UTC',
    backup_time: '24 September 2026, 02:15 UTC',
    checkpoint_at: '26 September 2026, 14:40 UTC',
    collaborator_name: 'Ines Duarte',
    commit_id: '9f3ab71',
    committed_at: '27 September 2026, 09:12 UTC',
    completed_at: '27 September 2026, 08:55 UTC',
    confirmed_at: '27 September 2026, 10:02 UTC',
    cutoff_date: '31 August 2026',
    data_cutoff: '30 June 2026, 23:59 UTC',
    date: '14 October 2026',
    destination_region: 'eu-west-2',
    device_name: 'Studio tablet',
    domain_name: 'books.example.org',
    editor_name: 'Tomas Lindqvist',
    effective_at: '1 November 2026',
    email_address: 'r.okonkwo@example.org',
    end_at: '27 September 2026, 11:30 UTC',
    endpoint_url: 'https://hooks.example.org/orders',
    estimated_total: '142.50 EUR',
    expires_at: '4 October 2026, 12:00 UTC',
    first_run_at: '28 September 2026, 09:00',
    host_name: 'docs.example.org',
    integration_name: 'Timesheet Import',
    lock_expires_at: '27 September 2026, 16:20 UTC',
    maintenance_date: '3 October 2026',
    meeting_date: '1 October 2026',
    modified_at: '18 September 2026, 15:47 UTC',
    new_owner: 'Ines Duarte',
    new_zone: 'Europe/Lisbon',
    old_zone: 'Europe/London',
    package_name: 'northstudio-invoice',
    period: 'June 2026',
    preview_at: '27 September 2026, 10:15 UTC',
    prorated_total: '48.60 EUR',
    recipient: 'diagnostics@example.org',
    registered_at: '27 September 2026, 09:40 UTC',
    registry_name: 'registry.example.org',
    renewal_total: '312.00 EUR',
    reply_to_address: 'service-hours@example.org',
    reservation_expires_at: '27 September 2026, 12:45 UTC',
    rollback_expiry: '4 October 2026, 09:00 UTC',
    saved_at: '27 September 2026, 08:30 UTC',
    selected_date: '5 October 2026',
    signed_at: '26 September 2026, 17:05 UTC',
    source_account: 'North Studio Ltd',
    source_region: 'eu-west-1',
    start_at: '27 September 2026, 10:00 UTC',
    status_location: 'status.example.org',
    support_agent: 'Priya Raman',
    synced_at: '27 September 2026, 07:50 UTC',
    target_name: 'pages.example.net',
    time_zone: 'Europe/London',
    usage_quantity: '1,240',
    version: '3.4.0'
  };

  /* Substitutes sample values for the blanks, so the reader can see the message
   * as it would arrive. A blank with no sample keeps its angle brackets rather
   * than disappearing, which is the honest thing for it to do. */
  function fill(passage, samples) {
    var table = samples || SAMPLES;
    return plain(passage).replace(/<([a-zA-Z][\w. -]*)>/g, function (whole, name) {
      return Object.prototype.hasOwnProperty.call(table, name) ? table[name] : whole;
    });
  }

  /* An entry stores only the passage it was written as. Every other reading of
   * it is derived here, once, so the stored text and the displayed text can
   * never drift apart. */
  function hydrate(catalog) {
    (catalog || []).forEach(function (entry) {
      if (entry && entry.passage && !entry.text) entry.text = plain(entry.passage);
    });
    return catalog;
  }

  window.CourtesyPassage = {
    paragraphs: paragraphs,
    runs: runs,
    plain: plain,
    blanks: blanks,
    fill: fill,
    samples: SAMPLES,
    hydrate: hydrate
  };
})();
